<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Snapshot tindakan: name & price tidak berubah meski treatment_master diperbarui. */
class Treatment extends Model
{
    protected $fillable = [
        'medical_record_id',
        'treatment_master_id',
        'name',
        'tooth_number',
        'price',
        'notes',
    ];

    protected function casts(): array
    {
        return ['price' => 'decimal:2'];
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function treatmentMaster(): BelongsTo
    {
        return $this->belongsTo(TreatmentMaster::class);
    }

    public function paymentDetails(): HasMany
    {
        return $this->hasMany(PaymentDetail::class);
    }
}
