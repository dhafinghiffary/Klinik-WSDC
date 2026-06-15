<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 8 — tabel induk (agregat) satu kunjungan pemeriksaan. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->restrictOnDelete();
            $table->foreignId('doctor_id')->constrained('doctors')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->restrictOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->restrictOnDelete();
            $table->date('visit_date');
            $table->text('anamnesis');
            $table->text('additional_notes')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('patient_id', 'idx_medical_records_patient_id');
            $table->index('doctor_id', 'idx_medical_records_doctor_id');
            $table->index('branch_id', 'idx_medical_records_branch_id');
            $table->index('visit_date', 'idx_medical_records_visit_date');
            $table->index('appointment_id', 'idx_medical_records_appointment_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            // Satu appointment hanya menghasilkan satu rekam medis (partial unique).
            DB::statement('CREATE UNIQUE INDEX uq_medical_records_appointment_id ON medical_records (appointment_id) WHERE appointment_id IS NOT NULL');
            // Riwayat kunjungan pasien kronologis menurun.
            DB::statement('CREATE INDEX idx_medical_records_patient_date ON medical_records (patient_id, visit_date DESC)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
