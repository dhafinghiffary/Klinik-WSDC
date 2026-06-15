<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Patient;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

/**
 * Generator nomor unik per-cabang untuk medical_record_number & invoice_number.
 *
 * Format (backend.md Bagian 5.6 & 5.13):
 *   - Nomor RM   : {KODE_CABANG}-{YYYY}-{NNNNNN}
 *   - Nomor faktur: {KODE_CABANG}-{YYYYMM}-{NNNNNN}
 *
 * Mitigasi race condition (backend.md Bagian 12.2 poin 6): dipanggil di dalam
 * DB::transaction dengan lockForUpdate pada baris terakhir cabang terkait.
 * TODO: untuk volume tinggi pertimbangkan PostgreSQL sequence per cabang.
 */
class NumberGenerator
{
    public function medicalRecordNumber(Branch $branch): string
    {
        $year = now()->format('Y');
        $prefix = "{$branch->code}-{$year}-";

        return DB::transaction(function () use ($branch, $prefix) {
            $last = Patient::withTrashed()
                ->where('home_branch_id', $branch->id)
                ->where('medical_record_number', 'like', $prefix.'%')
                ->lockForUpdate()
                ->orderByDesc('medical_record_number')
                ->value('medical_record_number');

            return $prefix.$this->nextSequence($last, 6);
        });
    }

    public function invoiceNumber(Branch $branch): string
    {
        $period = now()->format('Ym');
        $prefix = "{$branch->code}-{$period}-";

        return DB::transaction(function () use ($prefix) {
            $last = Payment::withTrashed()
                ->where('invoice_number', 'like', $prefix.'%')
                ->lockForUpdate()
                ->orderByDesc('invoice_number')
                ->value('invoice_number');

            return $prefix.$this->nextSequence($last, 6);
        });
    }

    private function nextSequence(?string $lastNumber, int $pad): string
    {
        $next = 1;

        if ($lastNumber !== null) {
            $segment = substr($lastNumber, strrpos($lastNumber, '-') + 1);
            $next = ((int) $segment) + 1;
        }

        return str_pad((string) $next, $pad, '0', STR_PAD_LEFT);
    }
}
