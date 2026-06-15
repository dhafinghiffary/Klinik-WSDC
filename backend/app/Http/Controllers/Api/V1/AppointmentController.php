<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentStatusRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Appointment::class);

        $appointments = Appointment::query()
            ->with(['patient', 'doctor', 'branch'])
            ->when($request->filled('date'), fn ($q) => $q->whereDate('appointment_date', $request->date('date')))
            ->when($request->filled('doctor_id'), fn ($q) => $q->where('doctor_id', $request->integer('doctor_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            // branch_id override hanya berlaku untuk Owner (BranchScope sudah memfilter non-owner).
            ->when($request->filled('branch_id') && $request->user()->isOwner(),
                fn ($q) => $q->where('branch_id', $request->integer('branch_id')))
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(AppointmentResource::collection($appointments), 'Daftar appointment.');
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = Appointment::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'status' => 'scheduled',
        ]);

        return $this->created(
            new AppointmentResource($appointment->load(['patient', 'doctor', 'branch'])),
            'Appointment berhasil dibuat.'
        );
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $this->authorize('view', $appointment);

        return $this->ok(
            new AppointmentResource($appointment->load(['patient', 'doctor', 'branch'])),
            'Detail appointment.'
        );
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        $appointment->update($request->validated());

        return $this->ok(
            new AppointmentResource($appointment->load(['patient', 'doctor', 'branch'])),
            'Appointment diperbarui.'
        );
    }

    public function updateStatus(UpdateAppointmentStatusRequest $request, Appointment $appointment): JsonResponse
    {
        $appointment->update(['status' => $request->validated('status')]);

        return $this->ok(new AppointmentResource($appointment), 'Status appointment diperbarui.');
    }

    /** Daftar kunjungan hari ini (otomatis ter-scope cabang). */
    public function today(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Appointment::class);

        $appointments = Appointment::query()
            ->with(['patient', 'doctor', 'branch'])
            ->whereDate('appointment_date', today())
            ->orderBy('appointment_time')
            ->get();

        return $this->ok(AppointmentResource::collection($appointments), 'Daftar kunjungan hari ini.');
    }

    /** Jadwal praktik dokter (untuk kalender booking). */
    public function doctorSchedule(Request $request, Doctor $doctor): JsonResponse
    {
        $doctor->load('branches');

        $schedule = $doctor->branches
            ->when($request->filled('branch_id'),
                fn ($branches) => $branches->where('id', $request->integer('branch_id')))
            ->map(fn ($branch) => [
                'branch_id' => $branch->id,
                'branch_name' => $branch->name,
                'schedule' => $branch->pivot->schedule,
            ])
            ->values();

        return $this->ok($schedule, 'Jadwal praktik dokter.');
    }
}
