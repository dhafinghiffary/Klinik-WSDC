<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreDoctorRequest;
use App\Http\Requests\Doctor\UpdateDoctorRequest;
use App\Http\Resources\DoctorResource;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $doctors = Doctor::query()
            ->with('branches')
            ->when($request->filled('branch_id'),
                fn ($q) => $q->whereHas('branches', fn ($b) => $b->where('branches.id', $request->integer('branch_id'))))
            ->orderBy('name')
            ->get();

        return $this->ok(DoctorResource::collection($doctors), 'Daftar dokter.');
    }

    public function store(StoreDoctorRequest $request): JsonResponse
    {
        $data = $request->validated();
        $doctor = Doctor::create($data);

        if (! empty($data['branch_ids'])) {
            $doctor->branches()->sync($data['branch_ids']);
        }

        return $this->created(new DoctorResource($doctor->load('branches')), 'Dokter berhasil dibuat.');
    }

    public function show(Doctor $doctor): JsonResponse
    {
        return $this->ok(new DoctorResource($doctor->load('branches')), 'Detail dokter.');
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor): JsonResponse
    {
        $data = $request->validated();
        $doctor->update($data);

        if (array_key_exists('branch_ids', $data)) {
            $doctor->branches()->sync($data['branch_ids'] ?? []);
        }

        return $this->ok(new DoctorResource($doctor->load('branches')), 'Dokter diperbarui.');
    }

    public function destroy(Doctor $doctor): JsonResponse
    {
        $doctor->delete();

        return $this->ok(null, 'Dokter berhasil dihapus.');
    }
}
