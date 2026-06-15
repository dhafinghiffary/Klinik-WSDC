<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * docs/database-schema.md Bagian 16 — header transaksi pembayaran.
 * patient_id, branch_id, doctor_id DENORMALIZED untuk optimasi query laporan (Bagian 10 backend.md).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->unique()->constrained('medical_records')->restrictOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->restrictOnDelete();
            $table->foreignId('doctor_id')->constrained('doctors')->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->string('invoice_number', 40)->unique();
            $table->enum('payment_method', ['cash', 'transfer']);
            $table->decimal('total_amount', 12, 2);
            $table->enum('discount_type', ['percentage', 'nominal'])->nullable();
            $table->decimal('discount_value', 12, 2)->nullable();
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('final_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->enum('status', ['pending', 'paid', 'partial', 'cancelled'])->default('pending');
            $table->timestampTz('paid_at')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('patient_id', 'idx_payments_patient_id');
            $table->index('branch_id', 'idx_payments_branch_id');
            $table->index('doctor_id', 'idx_payments_doctor_id');
            $table->index('status', 'idx_payments_status');
            $table->index('paid_at', 'idx_payments_paid_at');
            $table->index(['branch_id', 'paid_at'], 'idx_payments_branch_paid_at');
            $table->index(['doctor_id', 'paid_at'], 'idx_payments_doctor_paid_at');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE payments ADD CONSTRAINT chk_payments_total CHECK (total_amount >= 0)');
            DB::statement('ALTER TABLE payments ADD CONSTRAINT chk_payments_discount_value CHECK (discount_value IS NULL OR discount_value >= 0)');
            DB::statement('ALTER TABLE payments ADD CONSTRAINT chk_payments_discount_amount CHECK (discount_amount >= 0)');
            DB::statement('ALTER TABLE payments ADD CONSTRAINT chk_payments_final CHECK (final_amount >= 0)');
            DB::statement('ALTER TABLE payments ADD CONSTRAINT chk_payments_paid CHECK (paid_amount >= 0)');
            DB::statement('ALTER TABLE payments ADD CONSTRAINT chk_payments_amounts CHECK (final_amount = total_amount - discount_amount)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
