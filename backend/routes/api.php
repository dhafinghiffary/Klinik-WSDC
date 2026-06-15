<?php

use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\DoctorController;
use App\Http\Controllers\Api\V1\MedicalRecordController;
use App\Http\Controllers\Api\V1\OdontogramConditionController;
use App\Http\Controllers\Api\V1\PatientController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\TreatmentMasterController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 — Widya Santi Dental Care
|--------------------------------------------------------------------------
| Base URL: /api/v1  (apiPrefix "api" diset di bootstrap/app.php)
| Auth: Sanctum Bearer Token. Format response: lihat App\Http\Concerns\ApiResponse.
*/

Route::prefix('v1')->group(function () {

    // --- Public ---
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    // --- Terautentikasi ---
    Route::middleware('auth:sanctum')->group(function () {

        // Auth & profil
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);

        // Referensi master (read-only) untuk Admin/Dokter/Owner
        Route::get('treatment-masters', [TreatmentMasterController::class, 'index']);
        Route::get('treatment-masters/{treatment_master}', [TreatmentMasterController::class, 'show']);
        Route::get('odontogram-conditions', [OdontogramConditionController::class, 'index']);

        // Pasien (otorisasi granular via PatientPolicy)
        Route::get('patients', [PatientController::class, 'index']);
        Route::post('patients', [PatientController::class, 'store']);
        Route::get('patients/{patient}', [PatientController::class, 'show']);
        Route::match(['put', 'patch'], 'patients/{patient}', [PatientController::class, 'update']);
        Route::get('patients/{patient}/history', [PatientController::class, 'history']);
        Route::get('patients/{patient}/medical-records', [PatientController::class, 'medicalRecords']);
        Route::get('patients/{patient}/payments', [PatientController::class, 'payments']);

        // Appointments
        Route::get('appointments', [AppointmentController::class, 'index']);
        Route::get('appointments/today', [AppointmentController::class, 'today']);
        Route::post('appointments', [AppointmentController::class, 'store']);
        Route::get('appointments/{appointment}', [AppointmentController::class, 'show']);
        Route::match(['put', 'patch'], 'appointments/{appointment}', [AppointmentController::class, 'update']);
        Route::patch('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
        Route::get('doctors/{doctor}/schedule', [AppointmentController::class, 'doctorSchedule']);

        // Rekam medis (+ foto)
        Route::get('medical-records', [MedicalRecordController::class, 'index']);
        Route::post('medical-records', [MedicalRecordController::class, 'store']);
        Route::get('medical-records/{medical_record}', [MedicalRecordController::class, 'show']);
        Route::match(['put', 'patch'], 'medical-records/{medical_record}', [MedicalRecordController::class, 'update']);
        Route::post('medical-records/{medical_record}/photos', [MedicalRecordController::class, 'uploadPhoto']);
        Route::delete('medical-records/{medical_record}/photos/{photo}', [MedicalRecordController::class, 'deletePhoto']);

        // Pembayaran (Admin & Owner)
        Route::middleware('role:admin,owner')->group(function () {
            Route::get('payments', [PaymentController::class, 'index']);
            Route::post('payments', [PaymentController::class, 'store']);
            Route::get('payments/{payment}', [PaymentController::class, 'show']);
            Route::get('payments/{payment}/receipt', [PaymentController::class, 'receipt']);
        });

        // Laporan (Owner)
        Route::middleware('role:owner')->prefix('reports')->group(function () {
            Route::get('revenue/daily', [ReportController::class, 'revenueDaily']);
            Route::get('revenue/monthly', [ReportController::class, 'revenueMonthly']);
            Route::get('revenue/yearly', [ReportController::class, 'revenueYearly']);
            Route::get('revenue/by-doctor', [ReportController::class, 'revenueByDoctor']);
            Route::get('revenue/by-branch', [ReportController::class, 'revenueByBranch']);
            Route::get('patients/new-vs-returning', [ReportController::class, 'newVsReturning']);
        });

        // Master Data (Owner)
        Route::middleware('role:owner')->group(function () {
            Route::get('roles', [RoleController::class, 'index']);

            Route::apiResource('branches', BranchController::class);
            Route::apiResource('doctors', DoctorController::class);
            Route::apiResource('users', UserController::class);

            Route::post('treatment-masters', [TreatmentMasterController::class, 'store']);
            Route::match(['put', 'patch'], 'treatment-masters/{treatment_master}', [TreatmentMasterController::class, 'update']);
            Route::delete('treatment-masters/{treatment_master}', [TreatmentMasterController::class, 'destroy']);
        });
    });
});
