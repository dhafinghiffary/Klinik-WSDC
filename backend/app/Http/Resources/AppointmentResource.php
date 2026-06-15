<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'appointment_date' => $this->appointment_date?->toDateString(),
            'appointment_time' => $this->appointment_time,
            'status' => $this->status,
            'notes' => $this->notes,
            'patient' => new PatientResource($this->whenLoaded('patient')),
            'doctor' => new DoctorResource($this->whenLoaded('doctor')),
            'branch' => new BranchResource($this->whenLoaded('branch')),
            'created_at' => $this->created_at,
        ];
    }
}
