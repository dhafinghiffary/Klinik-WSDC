<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'medical_record_number' => $this->medical_record_number,
            'name' => $this->name,
            'nik' => $this->nik,
            'birth_place' => $this->birth_place,
            'birth_date' => $this->birth_date?->toDateString(),
            'age' => $this->age,
            'gender' => $this->gender,
            'address' => $this->address,
            'phone_number' => $this->phone_number,
            'occupation' => $this->occupation,
            'guardian_name' => $this->guardian_name,
            'guardian_phone' => $this->guardian_phone,
            'guardian_relation' => $this->guardian_relation,
            'drug_allergies' => $this->drug_allergies,
            'systemic_conditions' => $this->systemic_conditions,
            'home_branch' => new BranchResource($this->whenLoaded('homeBranch')),
            'visit_count' => $this->whenCounted('medicalRecords'),
            'created_at' => $this->created_at,
        ];
    }
}
