<?php

namespace App\Http\Requests\MedicalRecord;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('medical_record')) ?? false;
    }

    public function rules(): array
    {
        return [
            'visit_date' => ['sometimes', 'date'],
            'anamnesis' => ['sometimes', 'string'],
            'additional_notes' => ['nullable', 'string'],
        ];
    }
}
