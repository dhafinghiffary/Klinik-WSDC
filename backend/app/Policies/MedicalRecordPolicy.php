<?php

namespace App\Policies;

use App\Models\MedicalRecord;
use App\Models\User;

/** Matriks akses Rekam Medis — backend.md Bagian 4.2. */
class MedicalRecordPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(User::ROLE_ADMIN, User::ROLE_DOCTOR, User::ROLE_OWNER);
    }

    public function view(User $user, MedicalRecord $record): bool
    {
        // Admin: read-only ringkasan untuk billing. Owner: audit lintas cabang.
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        // Hanya Dokter yang membuat rekam medis.
        return $user->isDoctor();
    }

    /** Dokter hanya boleh mengedit rekam medis miliknya sendiri (backend.md 4.2). */
    public function update(User $user, MedicalRecord $record): bool
    {
        return $user->isDoctor() && $record->doctor_id === $user->doctor?->id;
    }
}
