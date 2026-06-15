<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Patient::class) ?? false;
    }

    public function rules(): array
    {
        return [
            // medical_record_number digenerate otomatis — tidak diterima dari client.
            'home_branch_id' => ['required', 'integer', 'exists:branches,id'],
            'name' => ['required', 'string', 'max:200'],
            'nik' => ['nullable', 'string', 'size:16', Rule::unique('patients', 'nik')->whereNull('deleted_at')],
            'birth_place' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date', 'before_or_equal:today'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'address' => ['required', 'string'],
            'phone_number' => ['required', 'string', 'max:20'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'guardian_name' => ['nullable', 'string', 'max:150'],
            'guardian_phone' => ['nullable', 'string', 'max:20'],
            'guardian_relation' => ['nullable', 'string', 'max:50'],
            'drug_allergies' => ['nullable', 'string'],
            'systemic_conditions' => ['nullable', 'string'],
        ];
    }
}
