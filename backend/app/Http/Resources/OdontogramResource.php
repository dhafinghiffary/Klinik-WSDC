<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OdontogramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tooth_number' => $this->tooth_number,
            'condition_code' => $this->condition_code,
            'odontogram_condition_id' => $this->odontogram_condition_id,
            'notes' => $this->notes,
        ];
    }
}
