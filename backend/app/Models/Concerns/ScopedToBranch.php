<?php

namespace App\Models\Concerns;

use App\Models\Scopes\BranchScope;

/**
 * Trait untuk model transaksional yang memiliki kolom `branch_id`
 * (appointments, medical_records, payments). Menerapkan BranchScope
 * secara otomatis. Gunakan ->withoutGlobalScope(BranchScope::class)
 * bila perlu query lintas cabang secara eksplisit.
 */
trait ScopedToBranch
{
    protected static function bootScopedToBranch(): void
    {
        static::addGlobalScope(new BranchScope());
    }
}
