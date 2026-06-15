<?php

namespace App\Http\Requests\MedicalRecord;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('medical_record')) ?? false;
    }

    public function rules(): array
    {
        $maxKb = (int) env('MEDIA_MAX_UPLOAD_KB', 5120);

        return [
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', "max:{$maxKb}"],
            'file_type' => ['required', Rule::in(['clinical_photo', 'xray', 'before', 'after', 'other'])],
            'caption' => ['nullable', 'string', 'max:255'],
        ];
    }
}
