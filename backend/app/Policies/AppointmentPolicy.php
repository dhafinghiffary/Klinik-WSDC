<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

/** Matriks akses Appointment — backend.md Bagian 4.1–4.3. */
class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(User::ROLE_ADMIN, User::ROLE_DOCTOR, User::ROLE_OWNER);
    }

    public function view(User $user, Appointment $appointment): bool
    {
        if ($user->isDoctor()) {
            return $appointment->doctor_id === $user->doctor?->id;
        }

        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(User::ROLE_ADMIN);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        return $user->hasRole(User::ROLE_ADMIN);
    }

    /** Dokter boleh memperbarui status kunjungan miliknya. */
    public function updateStatus(User $user, Appointment $appointment): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isDoctor()) {
            return $appointment->doctor_id === $user->doctor?->id;
        }

        return false;
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin();
    }
}
