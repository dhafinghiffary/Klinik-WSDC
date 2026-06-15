<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Pasien bersifat GLOBAL lintas cabang (backend.md Bagian 2.1).
 * Tidak menerapkan BranchScope; hanya memiliki home_branch_id sebagai cabang asal.
 */
class Patient extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'home_branch_id',
        'medical_record_number',
        'name',
        'nik',
        'birth_place',
        'birth_date',
        'gender',
        'address',
        'phone_number',
        'occupation',
        'guardian_name',
        'guardian_phone',
        'guardian_relation',
        'drug_allergies',
        'systemic_conditions',
    ];

    protected function casts(): array
    {
        return ['birth_date' => 'date'];
    }

    public function homeBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'home_branch_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(PatientPhoto::class);
    }

    /** Usia dinamis (tahun) dari tanggal lahir. */
    public function getAgeAttribute(): ?int
    {
        return $this->birth_date?->age;
    }
}
