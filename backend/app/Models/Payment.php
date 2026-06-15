<?php

namespace App\Models;

use App\Models\Concerns\ScopedToBranch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes, ScopedToBranch;

    public const METHODS = ['cash', 'transfer'];
    public const STATUSES = ['pending', 'paid', 'partial', 'cancelled'];

    protected $fillable = [
        'medical_record_id',
        'patient_id',
        'branch_id',
        'doctor_id',
        'created_by',
        'invoice_number',
        'payment_method',
        'total_amount',
        'discount_type',
        'discount_value',
        'discount_amount',
        'final_amount',
        'paid_amount',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'discount_value' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'final_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details(): HasMany
    {
        return $this->hasMany(PaymentDetail::class);
    }

    /** Kembalian (untuk pembayaran cash). */
    public function getChangeAmountAttribute(): string
    {
        return number_format(max(0, (float) $this->paid_amount - (float) $this->final_amount), 2, '.', '');
    }
}
