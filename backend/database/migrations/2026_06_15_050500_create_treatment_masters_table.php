<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 10 — master jenis tindakan & tarif standar. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treatment_masters', function (Blueprint $table) {
            $table->id();
            // branch_id NULL = tarif global; terisi = tarif khusus cabang.
            $table->foreignId('branch_id')->nullable()->constrained('branches')->restrictOnDelete();
            $table->string('name', 200);
            $table->decimal('default_price', 12, 2);
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->index('branch_id', 'idx_treatment_masters_branch_id');
            $table->index('is_active', 'idx_treatment_masters_is_active');
            $table->index('name', 'idx_treatment_masters_name');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE treatment_masters ADD CONSTRAINT chk_treatment_masters_price CHECK (default_price >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('treatment_masters');
    }
};
