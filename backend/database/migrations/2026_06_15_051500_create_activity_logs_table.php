<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 18 — audit trail perubahan data sensitif (rekam medis, pembayaran, pasien). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('log_name', 100)->nullable()->default('default');
            $table->text('description');
            $table->string('subject_type', 200)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('causer_type', 200)->nullable();
            $table->unsignedBigInteger('causer_id')->nullable();
            $table->string('event', 50)->nullable();
            $table->jsonb('properties')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['subject_type', 'subject_id'], 'idx_activity_logs_subject');
            $table->index(['causer_type', 'causer_id'], 'idx_activity_logs_causer');
            $table->index('log_name', 'idx_activity_logs_log_name');
            $table->index('created_at', 'idx_activity_logs_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
