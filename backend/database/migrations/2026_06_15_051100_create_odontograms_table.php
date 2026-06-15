<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * docs/database-schema.md Bagian 14 — kondisi tiap gigi pada satu kunjungan (snapshot historis).
 * condition_code adalah snapshot string (redundan dengan FK) demi keamanan data historis.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('odontograms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->cascadeOnDelete();
            $table->foreignId('odontogram_condition_id')->nullable()->constrained('odontogram_conditions')->restrictOnDelete();
            $table->string('tooth_number', 5);
            $table->string('condition_code', 30);
            $table->text('notes')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['medical_record_id', 'tooth_number'], 'uq_odontogram_tooth');
            $table->index('medical_record_id', 'idx_odontograms_medical_record_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('odontograms');
    }
};
