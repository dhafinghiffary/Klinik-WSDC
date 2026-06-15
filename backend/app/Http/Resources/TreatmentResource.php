<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TreatmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'treatment_master_id' => $this->treatment_master_id,
            'name' => $this->name,
            'tooth_number' => $this->tooth_number,
            'price' => $this->price,
            'notes' => $this->notes,
        ];
    }
}
