<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $branches = [
            ['name' => 'WSDC Cabang Pusat', 'code' => 'WSDC-A', 'address' => 'Jl. Contoh No. 1', 'phone' => '022-0000001'],
            ['name' => 'WSDC Cabang Dua', 'code' => 'WSDC-B', 'address' => 'Jl. Contoh No. 2', 'phone' => '022-0000002'],
            ['name' => 'WSDC Cabang Tiga', 'code' => 'WSDC-C', 'address' => 'Jl. Contoh No. 3', 'phone' => '022-0000003'],
        ];

        foreach ($branches as $branch) {
            Branch::updateOrCreate(['code' => $branch['code']], $branch);
        }
    }
}
