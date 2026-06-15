<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

/** Matriks akses Pasien — backend.md Bagian 4.1–4.3. */
class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(User::ROLE_ADMIN, User::ROLE_DOCTOR, User::ROLE_OWNER);
    }

    public function view(User $user, Patient $patient): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        // Admin yang mendaftarkan pasien baru.
        return $user->hasRole(User::ROLE_ADMIN);
    }

    public function update(User $user, Patient $patient): bool
    {
        return $user->hasRole(User::ROLE_ADMIN);
    }

    public function delete(User $user, Patient $patient): bool
    {
        // Soft delete dengan approval — perlu konfirmasi (backend.md 4.1). Default: Owner.
        return $user->isOwner();
    }
}
