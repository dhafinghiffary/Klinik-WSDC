<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\MedicalRecordResource;
use App\Http\Resources\PatientResource;
use App\Http\Resources\PaymentResource;
use App\Models\Branch;
use App\Models\Patient;
use App\Services\NumberGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function __construct(private NumberGenerator $numbers)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Patient::class);

        $patients = Patient::query()
            ->with('homeBranch')
            ->withCount('medicalRecords')
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->string('search');
                $q->where(function ($sub) use ($term) {
                    $sub->where('name', 'ilike', "%{$term}%")
                        ->orWhere('nik', 'like', "%{$term}%")
                        ->orWhere('phone_number', 'like', "%{$term}%")
                        ->orWhere('medical_record_number', 'like', "%{$term}%");
                });
            })
            ->latest('id')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(PatientResource::collection($patients), 'Daftar pasien.');
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $data = $request->validated();
        $branch = Branch::findOrFail($data['home_branch_id']);
        $data['medical_record_number'] = $this->numbers->medicalRecordNumber($branch);

        $patient = Patient::create($data);

        return $this->created(new PatientResource($patient->load('homeBranch')), 'Pasien berhasil didaftarkan.');
    }

    public function show(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);

        $patient->load('homeBranch')->loadCount('medicalRecords');

        return $this->ok(new PatientResource($patient), 'Detail pasien.');
    }

    public function update(UpdatePatientRequest $request, Patient $patient): JsonResponse
    {
        $patient->update($request->validated());

        return $this->ok(new PatientResource($patient->load('homeBranch')), 'Data pasien diperbarui.');
    }

    /** Riwayat kunjungan ringkas (appointments). */
    public function history(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);

        $appointments = $patient->appointments()
            ->with(['doctor', 'branch'])
            ->latest('appointment_date')
            ->get();

        return $this->ok(AppointmentResource::collection($appointments), 'Riwayat kunjungan pasien.');
    }

    /** Riwayat rekam medis lengkap. */
    public function medicalRecords(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);

        $records = $patient->medicalRecords()
            ->withoutGlobalScopes()
            ->with(['doctor', 'branch', 'diagnoses', 'treatments', 'prescriptions'])
            ->latest('visit_date')
            ->get();

        return $this->ok(MedicalRecordResource::collection($records), 'Riwayat rekam medis pasien.');
    }

    public function payments(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);

        $payments = $patient->payments()
            ->withoutGlobalScopes()
            ->with('details')
            ->latest('id')
            ->get();

        return $this->ok(PaymentResource::collection($payments), 'Riwayat pembayaran pasien.');
    }
}
