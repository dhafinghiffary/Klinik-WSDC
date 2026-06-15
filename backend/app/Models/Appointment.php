<?php

namespace App\Models;

use App\Models\Concerns\ScopedToBranch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use SoftDeletes, ScopedToBranch;

    public const STATUSES = [
        'scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show',
    ];

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'branch_id',
        'created_by',
        'appointment_date',
        'appointment_time',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return ['appointment_date' => 'date'];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function medicalRecord(): HasOne
    {
        return $this->hasOne(MedicalRecord::class);
    }
}
