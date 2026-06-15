<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 7 — penjadwalan kunjungan & antrian harian. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->restrictOnDelete();
            $table->foreignId('doctor_id')->constrained('doctors')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->date('appointment_date');
            $table->time('appointment_time')->nullable();
            $table->enum('status', [
                'scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show',
            ])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('patient_id', 'idx_appointments_patient_id');
            $table->index('doctor_id', 'idx_appointments_doctor_id');
            $table->index('branch_id', 'idx_appointments_branch_id');
            $table->index('appointment_date', 'idx_appointments_date');
            $table->index('status', 'idx_appointments_status');
            $table->index(['branch_id', 'appointment_date'], 'idx_appointments_branch_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
