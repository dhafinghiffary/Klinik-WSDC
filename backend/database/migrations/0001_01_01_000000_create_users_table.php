<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Membuat tabel fondasi autentikasi & otorisasi dalam urutan dependency:
 * roles → branches → users. Lihat docs/database-schema.md Bagian 1–3.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('display_name', 100);
            $table->text('description')->nullable();
            $table->timestampsTz();
        });

        // 2. branches
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('code', 20)->unique();
            $table->text('address');
            $table->string('phone', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->index('is_active', 'idx_branches_is_active');
        });

        // 3. users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->restrictOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->restrictOnDelete();
            $table->string('name', 150);
            $table->string('email', 200)->unique();
            $table->string('password');
            $table->boolean('is_active')->default(true);
            $table->timestampTz('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('role_id', 'idx_users_role_id');
            $table->index('branch_id', 'idx_users_branch_id');
            $table->index('is_active', 'idx_users_is_active');
        });

        // Standar framework — reset password & session driver database.
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestampTz('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('roles');
    }
};
