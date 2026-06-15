<?php

namespace App\Http\Requests\TreatmentMaster;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTreatmentMasterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(User::ROLE_OWNER) ?? false;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'name' => ['sometimes', 'string', 'max:200'],
            'default_price' => ['sometimes', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
