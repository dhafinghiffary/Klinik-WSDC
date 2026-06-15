<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OdontogramCondition extends Model
{
    protected $fillable = ['code', 'display_name', 'symbol', 'color', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function odontograms(): HasMany
    {
        return $this->hasMany(Odontogram::class);
    }
}
