<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TreatmentMasterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'branch_id' => $this->branch_id,
            'name' => $this->name,
            'default_price' => $this->default_price,
            'is_active' => $this->is_active,
            'branch' => new BranchResource($this->whenLoaded('branch')),
        ];
    }
}
