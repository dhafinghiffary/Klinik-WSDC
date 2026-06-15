<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 5 — pivot many-to-many dokter ↔ cabang + jadwal praktik. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_branch', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->jsonb('schedule')->nullable();
            $table->timestampsTz();

            $table->unique(['doctor_id', 'branch_id'], 'uq_doctor_branch');
            $table->index('doctor_id', 'idx_doctor_branch_doctor_id');
            $table->index('branch_id', 'idx_doctor_branch_branch_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_branch');
    }
};
