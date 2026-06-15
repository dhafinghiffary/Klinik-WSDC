<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Mengaktifkan ekstensi PostgreSQL yang dibutuhkan (docs/database-schema.md Bagian 21).
 * pg_trgm diperlukan untuk index GIN trigram pada pencarian nama pasien.
 * Di-skip otomatis bila driver bukan PostgreSQL (mis. SQLite saat testing).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('DROP EXTENSION IF EXISTS pg_trgm');
    }
};
