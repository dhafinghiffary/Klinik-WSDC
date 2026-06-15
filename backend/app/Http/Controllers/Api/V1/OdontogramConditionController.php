<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OdontogramConditionResource;
use App\Models\OdontogramCondition;
use Illuminate\Http\JsonResponse;

class OdontogramConditionController extends Controller
{
    /** Master kondisi gigi untuk rendering odontogram di frontend. */
    public function index(): JsonResponse
    {
        $conditions = OdontogramCondition::where('is_active', true)->orderBy('display_name')->get();

        return $this->ok(OdontogramConditionResource::collection($conditions), 'Daftar kondisi odontogram.');
    }
}
