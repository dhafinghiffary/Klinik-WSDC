<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Laporan agregasi (backend.md Bagian 10). Sumber utama: tabel payments
 * (memanfaatkan kolom denormalized branch_id/doctor_id). Hanya Owner (route group).
 */
class ReportController extends Controller
{
    /** Basis query pembayaran berstatus paid + filter cabang opsional. */
    private function paidQuery(Request $request): Builder
    {
        return Payment::query()
            ->withoutGlobalScopes()
            ->where('status', 'paid')
            ->when($request->filled('branch_id'), fn ($q) => $q->where('branch_id', $request->integer('branch_id')));
    }

    public function revenueDaily(Request $request): JsonResponse
    {
        $date = $request->date('date') ?? today();

        $query = $this->paidQuery($request)->whereDate('paid_at', $date);

        return $this->ok([
            'date' => $date->toDateString(),
            'total_revenue' => (float) (clone $query)->sum('final_amount'),
            'transaction_count' => (clone $query)->count(),
            'by_method' => (clone $query)
                ->select('payment_method', DB::raw('SUM(final_amount) as total'), DB::raw('COUNT(*) as count'))
                ->groupBy('payment_method')
                ->get(),
        ], 'Laporan pendapatan harian.');
    }

    public function revenueMonthly(Request $request): JsonResponse
    {
        $month = $request->integer('month', (int) now()->format('m'));
        $year = $request->integer('year', (int) now()->format('Y'));

        $trend = $this->paidQuery($request)
            ->whereYear('paid_at', $year)
            ->whereMonth('paid_at', $month)
            ->select(DB::raw('DATE(paid_at) as day'), DB::raw('SUM(final_amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return $this->ok([
            'month' => $month,
            'year' => $year,
            'total_revenue' => (float) $trend->sum('total'),
            'trend' => $trend,
        ], 'Laporan pendapatan bulanan.');
    }

    public function revenueYearly(Request $request): JsonResponse
    {
        $year = $request->integer('year', (int) now()->format('Y'));

        $trend = $this->paidQuery($request)
            ->whereYear('paid_at', $year)
            ->select(DB::raw('EXTRACT(MONTH FROM paid_at) as month'), DB::raw('SUM(final_amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $this->ok([
            'year' => $year,
            'total_revenue' => (float) $trend->sum('total'),
            'trend' => $trend,
        ], 'Laporan pendapatan tahunan.');
    }

    public function newVsReturning(Request $request): JsonResponse
    {
        $from = $request->date('date_from') ?? now()->startOfMonth();
        $to = $request->date('date_to') ?? now()->endOfMonth();

        $newPatients = Patient::query()
            ->when($request->filled('branch_id'), fn ($q) => $q->where('home_branch_id', $request->integer('branch_id')))
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $returningVisits = Payment::query()
            ->withoutGlobalScopes()
            ->when($request->filled('branch_id'), fn ($q) => $q->where('branch_id', $request->integer('branch_id')))
            ->whereBetween('created_at', [$from, $to])
            ->whereHas('patient', fn ($q) => $q->where('created_at', '<', $from))
            ->distinct('patient_id')
            ->count('patient_id');

        return $this->ok([
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'new_patients' => $newPatients,
            'returning_patients' => $returningVisits,
        ], 'Laporan pasien baru vs lama.');
    }

    public function revenueByDoctor(Request $request): JsonResponse
    {
        $rows = $this->dateScoped($request)
            ->select('doctor_id', DB::raw('SUM(final_amount) as total_revenue'), DB::raw('COUNT(*) as transaction_count'))
            ->when($request->filled('doctor_id'), fn ($q) => $q->where('doctor_id', $request->integer('doctor_id')))
            ->groupBy('doctor_id')
            ->with('doctor:id,name')
            ->orderByDesc('total_revenue')
            ->get();

        return $this->ok($rows, 'Laporan pendapatan per dokter.');
    }

    public function revenueByBranch(Request $request): JsonResponse
    {
        $rows = $this->dateScoped($request)
            ->select('branch_id', DB::raw('SUM(final_amount) as total_revenue'), DB::raw('COUNT(*) as transaction_count'))
            ->groupBy('branch_id')
            ->with('branch:id,name,code')
            ->orderByDesc('total_revenue')
            ->get();

        return $this->ok($rows, 'Laporan pendapatan per cabang.');
    }

    private function dateScoped(Request $request): Builder
    {
        return $this->paidQuery($request)
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate('paid_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->whereDate('paid_at', '<=', $request->date('date_to')));
    }
}
