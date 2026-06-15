<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TreatmentMaster\StoreTreatmentMasterRequest;
use App\Http\Requests\TreatmentMaster\UpdateTreatmentMasterRequest;
use App\Http\Resources\TreatmentMasterResource;
use App\Models\TreatmentMaster;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * GET dapat diakses Admin/Dokter/Owner (referensi input tindakan).
 * Mutasi (store/update/destroy) hanya Owner — diatur pada route group.
 */
class TreatmentMasterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $masters = TreatmentMaster::query()
            ->with('branch')
            ->when($request->boolean('active_only', true), fn ($q) => $q->where('is_active', true))
            ->when($request->filled('branch_id'), function ($q) use ($request) {
                // Tarif khusus cabang + tarif global (branch_id null).
                $q->where(fn ($sub) => $sub->where('branch_id', $request->integer('branch_id'))->orWhereNull('branch_id'));
            })
            ->orderBy('name')
            ->get();

        return $this->ok(TreatmentMasterResource::collection($masters), 'Daftar master tindakan.');
    }

    public function store(StoreTreatmentMasterRequest $request): JsonResponse
    {
        $master = TreatmentMaster::create($request->validated());

        return $this->created(new TreatmentMasterResource($master), 'Master tindakan berhasil dibuat.');
    }

    public function show(TreatmentMaster $treatmentMaster): JsonResponse
    {
        return $this->ok(new TreatmentMasterResource($treatmentMaster->load('branch')), 'Detail master tindakan.');
    }

    public function update(UpdateTreatmentMasterRequest $request, TreatmentMaster $treatmentMaster): JsonResponse
    {
        $treatmentMaster->update($request->validated());

        return $this->ok(new TreatmentMasterResource($treatmentMaster), 'Master tindakan diperbarui.');
    }

    public function destroy(TreatmentMaster $treatmentMaster): JsonResponse
    {
        $treatmentMaster->delete();

        return $this->ok(null, 'Master tindakan berhasil dihapus.');
    }
}
