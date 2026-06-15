<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 9 — diagnosa per rekam medis (multi-diagnosa). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->cascadeOnDelete();
            $table->string('diagnosis_code', 20)->nullable();
            $table->string('diagnosis_name', 300);
            $table->string('tooth_number', 10)->nullable();
            $table->text('notes')->nullable();
            $table->timestampsTz();

            $table->index('medical_record_id', 'idx_diagnoses_medical_record_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnoses');
    }
};
