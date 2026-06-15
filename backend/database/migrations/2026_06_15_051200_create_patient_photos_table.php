<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 15 — metadata foto medis pasien. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->restrictOnDelete();
            // Denormalized: ambil seluruh foto pasien tanpa join ke medical_records.
            $table->foreignId('patient_id')->constrained('patients')->restrictOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->string('file_path', 500);
            $table->string('file_url', 500)->nullable();
            $table->enum('file_type', ['clinical_photo', 'xray', 'before', 'after', 'other'])->default('clinical_photo');
            $table->string('caption', 255)->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->softDeletesTz();

            $table->index('medical_record_id', 'idx_patient_photos_medical_record_id');
            $table->index('patient_id', 'idx_patient_photos_patient_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_photos');
    }
};
