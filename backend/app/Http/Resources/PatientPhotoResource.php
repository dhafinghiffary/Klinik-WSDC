<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PatientPhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'medical_record_id' => $this->medical_record_id,
            'patient_id' => $this->patient_id,
            'file_type' => $this->file_type,
            'caption' => $this->caption,
            // Signed URL sementara untuk foto medis sensitif (backend.md Bagian 9.4).
            'url' => $this->resolveUrl(),
            'created_at' => $this->created_at,
        ];
    }

    private function resolveUrl(): ?string
    {
        if ($this->file_url) {
            return $this->file_url;
        }

        $disk = config('filesystems.default');
        $ttl = (int) env('MEDIA_SIGNED_URL_TTL', 30);

        try {
            return Storage::disk($disk)->temporaryUrl($this->file_path, now()->addMinutes($ttl));
        } catch (\Throwable) {
            // Disk lokal tidak mendukung temporaryUrl — kembalikan path relatif.
            return Storage::disk($disk)->url($this->file_path);
        }
    }
}
