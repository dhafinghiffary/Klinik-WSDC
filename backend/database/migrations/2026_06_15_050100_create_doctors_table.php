<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 4 — profil profesional dokter (terpisah dari users). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->restrictOnDelete();
            $table->string('name', 150);
            $table->string('sip_number', 50)->nullable();
            $table->string('specialization', 100)->nullable();
            $table->string('signature_image_path', 500)->nullable();
            $table->timestampsTz();

            $table->index('name', 'idx_doctors_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
