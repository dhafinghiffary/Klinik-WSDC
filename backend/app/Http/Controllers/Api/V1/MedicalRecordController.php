<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\MedicalRecord\StoreMedicalRecordRequest;
use App\Http\Requests\MedicalRecord\UpdateMedicalRecordRequest;
use App\Http\Requests\MedicalRecord\UploadPhotoRequest;
use App\Http\Resources\MedicalRecordResource;
use App\Http\Resources\PatientPhotoResource;
use App\Models\MedicalRecord;
use App\Models\PatientPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MedicalRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', MedicalRecord::class);

        $records = MedicalRecord::query()
            ->with(['patient', 'doctor', 'branch'])
            ->when($request->filled('patient_id'), fn ($q) => $q->where('patient_id', $request->integer('patient_id')))
            ->when($request->filled('doctor_id'), fn ($q) => $q->where('doctor_id', $request->integer('doctor_id')))
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate('visit_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->whereDate('visit_date', '<=', $request->date('date_to')))
            ->latest('visit_date')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(MedicalRecordResource::collection($records), 'Daftar rekam medis.');
    }

    /**
     * Membuat rekam medis agregat (induk + diagnoses + treatments + prescriptions + odontograms)
     * dalam satu DB transaction (backend.md Bagian 7.8 & 12.2 poin 1).
     */
    public function store(StoreMedicalRecordRequest $request): JsonResponse
    {
        $data = $request->validated();
        $doctorId = $request->user()->doctor?->id;

        $record = DB::transaction(function () use ($data, $doctorId) {
            $record = MedicalRecord::create([
                'patient_id' => $data['patient_id'],
                'doctor_id' => $doctorId,
                'branch_id' => $data['branch_id'],
                'appointment_id' => $data['appointment_id'] ?? null,
                'visit_date' => $data['visit_date'],
                'anamnesis' => $data['anamnesis'],
                'additional_notes' => $data['additional_notes'] ?? null,
            ]);

            if (! empty($data['diagnoses'])) {
                $record->diagnoses()->createMany($data['diagnoses']);
            }

            if (! empty($data['treatments'])) {
                // name & price disimpan sebagai SNAPSHOT (sudah dikirim client dari master).
                $record->treatments()->createMany($data['treatments']);
            }

            if (! empty($data['prescriptions'])) {
                $record->prescriptions()->createMany($data['prescriptions']);
            }

            if (! empty($data['odontograms'])) {
                $record->odontograms()->createMany($data['odontograms']);
            }

            return $record;
        });

        $record->load(['patient', 'doctor', 'branch', 'diagnoses', 'treatments', 'prescriptions', 'odontograms']);

        return $this->created(new MedicalRecordResource($record), 'Rekam medis berhasil dibuat.');
    }

    public function show(MedicalRecord $medicalRecord): JsonResponse
    {
        $this->authorize('view', $medicalRecord);

        $medicalRecord->load([
            'patient', 'doctor', 'branch',
            'diagnoses', 'treatments', 'prescriptions', 'odontograms', 'photos', 'payment',
        ]);

        return $this->ok(new MedicalRecordResource($medicalRecord), 'Detail rekam medis.');
    }

    public function update(UpdateMedicalRecordRequest $request, MedicalRecord $medicalRecord): JsonResponse
    {
        $medicalRecord->update($request->validated());

        return $this->ok(new MedicalRecordResource($medicalRecord), 'Rekam medis diperbarui.');
    }

    /** Upload foto medis (multipart/form-data) ke disk aktif. */
    public function uploadPhoto(UploadPhotoRequest $request, MedicalRecord $medicalRecord): JsonResponse
    {
        $path = $request->file('file')->store(
            "patients/{$medicalRecord->patient_id}/medical-records/{$medicalRecord->id}/photos",
            config('filesystems.default')
        );

        $photo = $medicalRecord->photos()->create([
            'patient_id' => $medicalRecord->patient_id,
            'uploaded_by' => $request->user()->id,
            'file_path' => $path,
            'file_type' => $request->validated('file_type'),
            'caption' => $request->validated('caption'),
        ]);

        return $this->created(new PatientPhotoResource($photo), 'Foto berhasil diunggah.');
    }

    /** Soft delete metadata foto (file fisik dipertahankan — backend.md Bagian 9.5). */
    public function deletePhoto(MedicalRecord $medicalRecord, PatientPhoto $photo): JsonResponse
    {
        $this->authorize('update', $medicalRecord);

        abort_unless($photo->medical_record_id === $medicalRecord->id, 404);

        $photo->delete();

        return $this->ok(null, 'Foto berhasil dihapus.');
    }
}
