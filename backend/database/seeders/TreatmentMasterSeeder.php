<?php

namespace Database\Seeders;

use App\Models\TreatmentMaster;
use Illuminate\Database\Seeder;

/** Tarif global awal (branch_id null). Tarif final mengikuti data client. */
class TreatmentMasterSeeder extends Seeder
{
    public function run(): void
    {
        $treatments = [
            ['name' => 'Konsultasi / Pemeriksaan', 'default_price' => 50000],
            ['name' => 'Scaling (Pembersihan Karang Gigi)', 'default_price' => 250000],
            ['name' => 'Tambal Gigi Komposit', 'default_price' => 200000],
            ['name' => 'Cabut Gigi Sederhana', 'default_price' => 150000],
            ['name' => 'Cabut Gigi Bungsu (Odontektomi)', 'default_price' => 1500000],
            ['name' => 'Perawatan Saluran Akar', 'default_price' => 750000],
            ['name' => 'Pembuatan Mahkota (Crown)', 'default_price' => 2000000],
            ['name' => 'Behel / Ortodonti (Pemasangan)', 'default_price' => 5000000],
        ];

        foreach ($treatments as $treatment) {
            TreatmentMaster::updateOrCreate(
                ['name' => $treatment['name'], 'branch_id' => null],
                ['default_price' => $treatment['default_price'], 'is_active' => true]
            );
        }
    }
}
