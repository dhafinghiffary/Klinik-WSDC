<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/** Autentikasi Sanctum Personal Access Token (backend.md Bagian 8). */
class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::with(['role', 'branch', 'doctor'])
            ->where('email', $request->email)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda tidak aktif. Hubungi Owner.'],
            ]);
        }

        $deviceName = $request->input('device_name', $request->userAgent() ?? 'api');
        $token = $user->createToken($deviceName)->plainTextToken;

        return $this->ok([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login berhasil.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role', 'branch', 'doctor']);

        return $this->ok(new UserResource($user), 'Profil pengguna.');
    }

    public function logout(Request $request): JsonResponse
    {
        // Hanya mencabut token aktif (mendukung multi-device — backend.md Bagian 8.2).
        $request->user()->currentAccessToken()->delete();

        return $this->ok(null, 'Logout berhasil.');
    }
}
