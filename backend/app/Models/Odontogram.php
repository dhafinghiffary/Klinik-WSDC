<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Odontogram extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'medical_record_id',
        'odontogram_condition_id',
        'tooth_number',
        'condition_code',
        'notes',
    ];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function condition(): BelongsTo
    {
        return $this->belongsTo(OdontogramCondition::class, 'odontogram_condition_id');
    }
}
