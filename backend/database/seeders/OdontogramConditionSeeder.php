<?php

namespace Database\Seeders;

use App\Models\OdontogramCondition;
use Illuminate\Database\Seeder;

/**
 * Daftar kondisi gigi awal. Daftar final perlu disusun bersama dokter
 * (backend.md Bagian 5.12 — perlu konfirmasi).
 */
class OdontogramConditionSeeder extends Seeder
{
    public function run(): void
    {
        $conditions = [
            ['code' => 'healthy', 'display_name' => 'Sehat', 'symbol' => '', 'color' => '#22c55e'],
            ['code' => 'caries', 'display_name' => 'Karies', 'symbol' => 'C', 'color' => '#ef4444'],
            ['code' => 'filled', 'display_name' => 'Tambalan', 'symbol' => 'F', 'color' => '#3b82f6'],
            ['code' => 'missing', 'display_name' => 'Hilang/Tanggal', 'symbol' => 'X', 'color' => '#6b7280'],
            ['code' => 'extraction_needed', 'display_name' => 'Indikasi Cabut', 'symbol' => 'E', 'color' => '#f97316'],
            ['code' => 'root_canal', 'display_name' => 'Perawatan Saluran Akar', 'symbol' => 'R', 'color' => '#a855f7'],
            ['code' => 'crown', 'display_name' => 'Mahkota', 'symbol' => 'Cr', 'color' => '#eab308'],
            ['code' => 'implant', 'display_name' => 'Implan', 'symbol' => 'Im', 'color' => '#06b6d4'],
        ];

        foreach ($conditions as $condition) {
            OdontogramCondition::updateOrCreate(['code' => $condition['code']], $condition);
        }
    }
}
