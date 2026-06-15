<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 13 — master kondisi gigi untuk konsistensi rendering odontogram. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('odontogram_conditions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('display_name', 100);
            $table->string('symbol', 10)->nullable();
            $table->string('color', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->index('is_active', 'idx_odontogram_conditions_is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('odontogram_conditions');
    }
};
