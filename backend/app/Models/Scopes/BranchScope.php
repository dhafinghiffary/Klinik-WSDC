<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

/**
 * Global Scope multi-cabang (backend.md Bagian 4.4 & 8.4).
 *
 * Memfilter query otomatis berdasarkan branch_id milik user yang sedang login.
 * Role Owner di-bypass (akses lintas cabang). Bila tidak ada user terautentikasi
 * (mis. seeder, command artisan), scope tidak diterapkan.
 */
class BranchScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::user();

        if (! $user) {
            return;
        }

        // Owner melihat seluruh cabang.
        if (method_exists($user, 'isOwner') && $user->isOwner()) {
            return;
        }

        // User tanpa branch_id (mis. akun sistem) tidak difilter.
        if (empty($user->branch_id)) {
            return;
        }

        $builder->where($model->getTable().'.branch_id', $user->branch_id);
    }
}
