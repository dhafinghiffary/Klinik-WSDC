<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

/** Matriks akses Pembayaran — backend.md Bagian 4.1 & 4.3. */
class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(User::ROLE_ADMIN, User::ROLE_OWNER);
    }

    public function view(User $user, Payment $payment): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /** Admin boleh mengubah pembayaran selama belum berstatus final (paid). */
    public function update(User $user, Payment $payment): bool
    {
        return $user->isAdmin() && $payment->status !== 'paid';
    }
}
