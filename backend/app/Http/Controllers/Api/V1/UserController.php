<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Manajemen akun pengguna — akses Owner (route group). */
class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->with(['role', 'branch'])
            ->when($request->filled('role_id'), fn ($q) => $q->where('role_id', $request->integer('role_id')))
            ->when($request->filled('branch_id'), fn ($q) => $q->where('branch_id', $request->integer('branch_id')))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(UserResource::collection($users), 'Daftar pengguna.');
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return $this->created(new UserResource($user->load(['role', 'branch'])), 'Pengguna berhasil dibuat.');
    }

    public function show(User $user): JsonResponse
    {
        return $this->ok(new UserResource($user->load(['role', 'branch', 'doctor'])), 'Detail pengguna.');
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        // Jangan timpa password bila tidak dikirim.
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return $this->ok(new UserResource($user->load(['role', 'branch'])), 'Pengguna diperbarui.');
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return $this->ok(null, 'Pengguna berhasil dihapus.');
    }
}
