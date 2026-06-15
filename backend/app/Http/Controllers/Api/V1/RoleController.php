<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /** Daftar role untuk dropdown form manajemen pengguna. */
    public function index(): JsonResponse
    {
        return $this->ok(RoleResource::collection(Role::orderBy('id')->get()), 'Daftar role.');
    }
}
