<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('patient')) ?? false;
    }

    public function rules(): array
    {
        $patientId = $this->route('patient')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:200'],
            'nik' => ['nullable', 'string', 'size:16', Rule::unique('patients', 'nik')->ignore($patientId)->whereNull('deleted_at')],
            'birth_place' => ['sometimes', 'string', 'max:100'],
            'birth_date' => ['sometimes', 'date', 'before_or_equal:today'],
            'gender' => ['sometimes', Rule::in(['male', 'female'])],
            'address' => ['sometimes', 'string'],
            'phone_number' => ['sometimes', 'string', 'max:20'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'guardian_name' => ['nullable', 'string', 'max:150'],
            'guardian_phone' => ['nullable', 'string', 'max:20'],
            'guardian_relation' => ['nullable', 'string', 'max:50'],
            'drug_allergies' => ['nullable', 'string'],
            'systemic_conditions' => ['nullable', 'string'],
        ];
    }
}
