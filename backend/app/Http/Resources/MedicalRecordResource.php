<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicalRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'visit_date' => $this->visit_date?->toDateString(),
            'anamnesis' => $this->anamnesis,
            'additional_notes' => $this->additional_notes,
            'patient' => new PatientResource($this->whenLoaded('patient')),
            'doctor' => new DoctorResource($this->whenLoaded('doctor')),
            'branch' => new BranchResource($this->whenLoaded('branch')),
            'appointment_id' => $this->appointment_id,
            'diagnoses' => DiagnosisResource::collection($this->whenLoaded('diagnoses')),
            'treatments' => TreatmentResource::collection($this->whenLoaded('treatments')),
            'prescriptions' => PrescriptionResource::collection($this->whenLoaded('prescriptions')),
            'odontograms' => OdontogramResource::collection($this->whenLoaded('odontograms')),
            'photos' => PatientPhotoResource::collection($this->whenLoaded('photos')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'created_at' => $this->created_at,
        ];
    }
}
