<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Doctor;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/** Akun awal per role untuk testing tim frontend (backend.md Roadmap Tahap 1). */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Role::where('name', 'admin')->firstOrFail();
        $doctor = Role::where('name', 'doctor')->firstOrFail();
        $owner = Role::where('name', 'owner')->firstOrFail();

        $branchA = Branch::where('code', 'WSDC-A')->firstOrFail();
        $branchB = Branch::where('code', 'WSDC-B')->firstOrFail();

        // Owner (tanpa branch_id — lintas cabang)
        User::updateOrCreate(
            ['email' => 'owner@wsdc.test'],
            [
                'role_id' => $owner->id,
                'branch_id' => null,
                'name' => 'Owner WSDC',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );

        // Admin cabang A
        User::updateOrCreate(
            ['email' => 'admin@wsdc.test'],
            [
                'role_id' => $admin->id,
                'branch_id' => $branchA->id,
                'name' => 'Admin Cabang A',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );

        // Dokter cabang A + profil dokter
        $doctorUser = User::updateOrCreate(
            ['email' => 'dokter@wsdc.test'],
            [
                'role_id' => $doctor->id,
                'branch_id' => $branchA->id,
                'name' => 'drg. Contoh',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );

        $doctorProfile = Doctor::updateOrCreate(
            ['user_id' => $doctorUser->id],
            [
                'name' => 'drg. Contoh',
                'sip_number' => 'SIP-0001',
                'specialization' => 'Dokter Gigi Umum',
            ]
        );

        // Dokter bertugas di cabang A & B (relasi many-to-many)
        $doctorProfile->branches()->syncWithoutDetaching([
            $branchA->id => ['schedule' => json_encode(['days' => ['monday', 'wednesday'], 'start_time' => '08:00', 'end_time' => '12:00'])],
            $branchB->id => ['schedule' => json_encode(['days' => ['friday'], 'start_time' => '13:00', 'end_time' => '17:00'])],
        ]);
    }
}
