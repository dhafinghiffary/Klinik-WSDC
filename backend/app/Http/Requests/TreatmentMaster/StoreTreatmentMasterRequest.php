<?php

namespace App\Http\Requests\TreatmentMaster;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreTreatmentMasterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(User::ROLE_OWNER) ?? false;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'name' => ['required', 'string', 'max:200'],
            'default_price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
