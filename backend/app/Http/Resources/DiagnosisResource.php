<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiagnosisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'diagnosis_code' => $this->diagnosis_code,
            'diagnosis_name' => $this->diagnosis_name,
            'tooth_number' => $this->tooth_number,
            'notes' => $this->notes,
        ];
    }
}
