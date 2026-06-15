<?php

namespace App\Http\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\AbstractPaginator;

/**
 * Format response JSON terstandarisasi (backend.md Bagian 7):
 * { success, message, data, meta }.
 */
trait ApiResponse
{
    protected function ok(mixed $data = null, string $message = 'OK', int $status = 200, array $meta = []): JsonResponse
    {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if (! empty($meta)) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    protected function created(mixed $data = null, string $message = 'Data berhasil dibuat.'): JsonResponse
    {
        return $this->ok($data, $message, 201);
    }

    protected function fail(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if (! empty($errors)) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }

    /**
     * Bungkus paginator/koleksi resource ke format standar dengan meta pagination.
     */
    protected function paginated($paginator, string $message = 'OK'): JsonResponse
    {
        if ($paginator instanceof ResourceCollection) {
            $resource = $paginator->resource;
        } else {
            $resource = $paginator;
        }

        $data = $paginator instanceof JsonResource
            ? $paginator->resolve()
            : ($paginator instanceof AbstractPaginator ? $paginator->items() : $paginator);

        $meta = [];
        if ($resource instanceof AbstractPaginator) {
            $meta['pagination'] = [
                'current_page' => $resource->currentPage(),
                'per_page' => $resource->perPage(),
                'total' => $resource->total(),
                'last_page' => $resource->lastPage(),
                'from' => $resource->firstItem(),
                'to' => $resource->lastItem(),
            ];
        }

        return $this->ok($data, $message, 200, $meta);
    }
}
