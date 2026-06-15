<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** docs/database-schema.md Bagian 17 — rincian item (tindakan) yang dibayar per transaksi. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignId('treatment_id')->constrained('treatments')->restrictOnDelete();
            $table->string('description', 200);
            $table->decimal('price', 12, 2);
            $table->smallInteger('quantity')->default(1);
            $table->decimal('subtotal', 12, 2);
            $table->timestampTz('created_at')->useCurrent();

            $table->index('payment_id', 'idx_payment_details_payment_id');
            $table->index('treatment_id', 'idx_payment_details_treatment_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE payment_details ADD CONSTRAINT chk_payment_details_price CHECK (price >= 0)');
            DB::statement('ALTER TABLE payment_details ADD CONSTRAINT chk_payment_details_quantity CHECK (quantity > 0)');
            DB::statement('ALTER TABLE payment_details ADD CONSTRAINT chk_payment_details_subtotal CHECK (subtotal = price * quantity)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_details');
    }
};
