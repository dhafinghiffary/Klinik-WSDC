<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 6 — data identitas pasien (global lintas cabang). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_branch_id')->constrained('branches')->restrictOnDelete();
            $table->string('medical_record_number', 30)->unique();
            $table->string('name', 200);
            $table->string('nik', 16)->nullable();
            $table->string('birth_place', 100);
            $table->date('birth_date');
            $table->enum('gender', ['male', 'female']);
            $table->text('address');
            $table->string('phone_number', 20);
            $table->string('occupation', 100)->nullable();
            // Data wali (untuk pasien anak/lansia) — docs/database-schema.md Bagian 6.
            $table->string('guardian_name', 150)->nullable();
            $table->string('guardian_phone', 20)->nullable();
            $table->string('guardian_relation', 50)->nullable();
            // Riwayat medis ringkas.
            $table->text('drug_allergies')->nullable();
            $table->text('systemic_conditions')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('phone_number', 'idx_patients_phone_number');
            $table->index('home_branch_id', 'idx_patients_home_branch_id');
            $table->index('birth_date', 'idx_patients_birth_date');
        });

        // Index khusus PostgreSQL (pg_trgm + partial unique). Di-skip pada driver lain.
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE INDEX idx_patients_name_trgm ON patients USING GIN (name gin_trgm_ops)');
            DB::statement('CREATE UNIQUE INDEX uq_patients_nik_partial ON patients (nik) WHERE nik IS NOT NULL');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
