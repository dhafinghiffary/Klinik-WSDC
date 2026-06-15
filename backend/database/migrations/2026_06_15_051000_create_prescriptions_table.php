<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 12 — resep obat per rekam medis (multi-obat). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->cascadeOnDelete();
            $table->string('medicine_name', 200);
            $table->string('dosage', 50);
            $table->string('frequency', 100);
            $table->smallInteger('quantity');
            $table->text('notes')->nullable();
            $table->timestampsTz();

            $table->index('medical_record_id', 'idx_prescriptions_medical_record_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE prescriptions ADD CONSTRAINT chk_prescriptions_quantity CHECK (quantity > 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
