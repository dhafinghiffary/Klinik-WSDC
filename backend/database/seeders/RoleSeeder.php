<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'admin', 'display_name' => 'Administrator', 'description' => 'Staf pendaftaran, jadwal, dan pembayaran cabang.'],
            ['name' => 'doctor', 'display_name' => 'Dokter', 'description' => 'Dokter gigi — rekam medis & odontogram.'],
            ['name' => 'owner', 'display_name' => 'Owner', 'description' => 'Pemilik — akses lintas cabang, laporan, master data.'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['name' => $role['name']], $role);
        }
    }
}
