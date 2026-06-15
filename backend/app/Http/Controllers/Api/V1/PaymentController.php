<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\MedicalRecord;
use App\Models\Payment;
use App\Services\NumberGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct(private NumberGenerator $numbers)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $payments = Payment::query()
            ->with(['patient', 'doctor', 'branch'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('payment_method'), fn ($q) => $q->where('payment_method', $request->string('payment_method')))
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate('created_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->whereDate('created_at', '<=', $request->date('date_to')))
            ->when($request->filled('branch_id') && $request->user()->isOwner(),
                fn ($q) => $q->where('branch_id', $request->integer('branch_id')))
            ->latest('id')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(PaymentResource::collection($payments), 'Daftar pembayaran.');
    }

    /**
     * Membuat transaksi pembayaran dari rekam medis.
     * Total/diskon/kembalian dihitung server-side; detail item adalah snapshot tindakan.
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $payment = DB::transaction(function () use ($data, $request) {
            $record = MedicalRecord::withoutGlobalScopes()
                ->with(['treatments' => fn ($q) => $q->whereIn('id', $data['treatment_ids'])])
                ->findOrFail($data['medical_record_id']);

            $treatments = $record->treatments;
            $total = (float) $treatments->sum('price');

            $discountAmount = $this->resolveDiscount(
                $total,
                $data['discount_type'] ?? null,
                isset($data['discount_value']) ? (float) $data['discount_value'] : null,
            );

            $final = max(0, $total - $discountAmount);

            $branch = $request->user()->branch ?? $record->branch;

            $payment = Payment::create([
                'medical_record_id' => $record->id,
                'patient_id' => $record->patient_id,
                'branch_id' => $record->branch_id,
                'doctor_id' => $record->doctor_id,
                'created_by' => $request->user()->id,
                'invoice_number' => $this->numbers->invoiceNumber($branch),
                'payment_method' => $data['payment_method'],
                'total_amount' => $total,
                'discount_type' => $data['discount_type'] ?? null,
                'discount_value' => $data['discount_value'] ?? null,
                'discount_amount' => $discountAmount,
                'final_amount' => $final,
                'paid_amount' => $data['paid_amount'],
                'status' => $data['paid_amount'] >= $final ? 'paid' : 'partial',
                'paid_at' => $data['paid_amount'] >= $final ? now() : null,
            ]);

            foreach ($treatments as $treatment) {
                $payment->details()->create([
                    'treatment_id' => $treatment->id,
                    'description' => $treatment->name,
                    'price' => $treatment->price,
                    'quantity' => 1,
                    'subtotal' => $treatment->price,
                ]);
            }

            return $payment;
        });

        $payment->load(['patient', 'doctor', 'branch', 'details']);

        return $this->created(new PaymentResource($payment), 'Pembayaran berhasil diproses.');
    }

    public function show(Payment $payment): JsonResponse
    {
        $this->authorize('view', $payment);

        $payment->load(['patient', 'doctor', 'branch', 'details']);

        return $this->ok(new PaymentResource($payment), 'Detail pembayaran.');
    }

    /**
     * Data terstruktur kwitansi. Pendekatan generate PDF (backend vs frontend)
     * masih open question (backend.md Bagian 12.1 poin 3) — endpoint mengembalikan data.
     */
    public function receipt(Payment $payment): JsonResponse
    {
        $this->authorize('view', $payment);

        $payment->load(['patient', 'doctor', 'branch', 'details']);

        return $this->ok([
            'clinic' => [
                'name' => $payment->branch->name,
                'address' => $payment->branch->address,
                'phone' => $payment->branch->phone,
            ],
            'payment' => new PaymentResource($payment),
        ], 'Data kwitansi.');
    }

    private function resolveDiscount(float $total, ?string $type, ?float $value): float
    {
        if ($type === null || $value === null) {
            return 0.0;
        }

        return $type === 'percentage'
            ? round($total * ($value / 100), 2)
            : min($value, $total);
    }
}
