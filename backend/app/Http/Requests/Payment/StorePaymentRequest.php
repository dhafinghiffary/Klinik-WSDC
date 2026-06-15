<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Payment::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'medical_record_id' => ['required', 'integer', 'exists:medical_records,id', 'unique:payments,medical_record_id'],
            'payment_method' => ['required', Rule::in(['cash', 'transfer'])],
            'treatment_ids' => ['required', 'array', 'min:1'],
            'treatment_ids.*' => ['integer', 'exists:treatments,id'],
            'discount_type' => ['nullable', Rule::in(['percentage', 'nominal'])],
            'discount_value' => ['nullable', 'numeric', 'min:0', 'required_with:discount_type'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
