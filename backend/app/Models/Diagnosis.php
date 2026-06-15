<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diagnosis extends Model
{
    protected $table = 'diagnoses';

    protected $fillable = [
        'medical_record_id',
        'diagnosis_code',
        'diagnosis_name',
        'tooth_number',
        'notes',
    ];

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }
}
