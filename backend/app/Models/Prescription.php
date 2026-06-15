<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prescription extends Model
{
    protected $fillable = [
        'medical_record_id',
        'medicine_name',
        'dosage',
        'frequency',
        'quantity',
        'notes',
    ];

    protected function casts(): array
    {
        return ['quantity' => 'integer'];
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }
}
