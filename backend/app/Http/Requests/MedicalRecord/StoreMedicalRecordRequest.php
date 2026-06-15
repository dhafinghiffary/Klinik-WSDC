<?php

namespace App\Http\Requests\MedicalRecord;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Payload agregat rekam medis (backend.md Bagian 7.4 & 7.8):
 * induk + diagnoses[] + treatments[] + prescriptions[] + odontograms[].
 * Disimpan dalam satu DB::transaction (lihat MedicalRecordController::store).
 */
class StoreMedicalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\MedicalRecord::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
            'visit_date' => ['required', 'date'],
            'anamnesis' => ['required', 'string'],
            'additional_notes' => ['nullable', 'string'],

            'diagnoses' => ['sometimes', 'array'],
            'diagnoses.*.diagnosis_code' => ['nullable', 'string', 'max:20'],
            'diagnoses.*.diagnosis_name' => ['required_with:diagnoses', 'string', 'max:300'],
            'diagnoses.*.tooth_number' => ['nullable', 'string', 'max:10'],
            'diagnoses.*.notes' => ['nullable', 'string'],

            'treatments' => ['sometimes', 'array'],
            'treatments.*.treatment_master_id' => ['nullable', 'integer', 'exists:treatment_masters,id'],
            'treatments.*.name' => ['required_with:treatments', 'string', 'max:200'],
            'treatments.*.tooth_number' => ['nullable', 'string', 'max:10'],
            'treatments.*.price' => ['required_with:treatments', 'numeric', 'min:0'],
            'treatments.*.notes' => ['nullable', 'string'],

            'prescriptions' => ['sometimes', 'array'],
            'prescriptions.*.medicine_name' => ['required_with:prescriptions', 'string', 'max:200'],
            'prescriptions.*.dosage' => ['required_with:prescriptions', 'string', 'max:50'],
            'prescriptions.*.frequency' => ['required_with:prescriptions', 'string', 'max:100'],
            'prescriptions.*.quantity' => ['required_with:prescriptions', 'integer', 'min:1'],
            'prescriptions.*.notes' => ['nullable', 'string'],

            'odontograms' => ['sometimes', 'array'],
            'odontograms.*.tooth_number' => ['required_with:odontograms', 'string', 'max:5'],
            'odontograms.*.condition_code' => ['required_with:odontograms', 'string', 'max:30'],
            'odontograms.*.odontogram_condition_id' => ['nullable', 'integer', 'exists:odontogram_conditions,id'],
            'odontograms.*.notes' => ['nullable', 'string'],
        ];
    }
}
