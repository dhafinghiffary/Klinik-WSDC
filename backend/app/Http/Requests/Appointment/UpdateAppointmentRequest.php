<?php

namespace App\Http\Requests\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('appointment')) ?? false;
    }

    public function rules(): array
    {
        return [
            'doctor_id' => ['sometimes', 'integer', 'exists:doctors,id'],
            'appointment_date' => ['sometimes', 'date'],
            'appointment_time' => ['nullable', 'date_format:H:i'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
