<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'sip_number' => $this->sip_number,
            'specialization' => $this->specialization,
            'branches' => BranchResource::collection($this->whenLoaded('branches')),
        ];
    }
}
