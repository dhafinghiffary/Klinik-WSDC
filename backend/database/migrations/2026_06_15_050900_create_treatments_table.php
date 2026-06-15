<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * docs/database-schema.md Bagian 11 — tindakan medis per kunjungan.
 * `name` & `price` adalah SNAPSHOT dari treatment_masters (tidak berubah meski master diupdate).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->cascadeOnDelete();
            $table->foreignId('treatment_master_id')->nullable()->constrained('treatment_masters')->nullOnDelete();
            $table->string('name', 200);
            $table->string('tooth_number', 10)->nullable();
            $table->decimal('price', 12, 2);
            $table->text('notes')->nullable();
            $table->timestampsTz();

            $table->index('medical_record_id', 'idx_treatments_medical_record_id');
            $table->index('treatment_master_id', 'idx_treatments_treatment_master_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE treatments ADD CONSTRAINT chk_treatments_price CHECK (price >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('treatments');
    }
};
