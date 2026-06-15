<?php

namespace App\Http\Requests\Doctor;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(User::ROLE_OWNER) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:150'],
            'sip_number' => ['nullable', 'string', 'max:50'],
            'specialization' => ['nullable', 'string', 'max:100'],
            'branch_ids' => ['sometimes', 'array'],
            'branch_ids.*' => ['integer', 'exists:branches,id'],
        ];
    }
}
