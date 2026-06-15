<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $branches = Branch::query()
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('name')
            ->get();

        return $this->ok(BranchResource::collection($branches), 'Daftar cabang.');
    }

    public function store(StoreBranchRequest $request): JsonResponse
    {
        $branch = Branch::create($request->validated());

        return $this->created(new BranchResource($branch), 'Cabang berhasil dibuat.');
    }

    public function show(Branch $branch): JsonResponse
    {
        return $this->ok(new BranchResource($branch), 'Detail cabang.');
    }

    public function update(UpdateBranchRequest $request, Branch $branch): JsonResponse
    {
        $branch->update($request->validated());

        return $this->ok(new BranchResource($branch), 'Cabang diperbarui.');
    }

    public function destroy(Branch $branch): JsonResponse
    {
        // Akses Owner sudah dijamin oleh middleware role:owner pada route group.
        $branch->delete();

        return $this->ok(null, 'Cabang berhasil dihapus.');
    }
}
