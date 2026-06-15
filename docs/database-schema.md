# Database Schema — Widya Santi Dental Care (WSDC)

**Versi Dokumen:** 1.0  
**Tanggal:** 15 Juni 2026  
**Sumber:** `frontend.md` v1.0 + `backend.md` v1.0 + `erd.md` v1.0  
**Database:** PostgreSQL 15+  
**Audience:** Database Engineer, Backend Developer  
**Status:** Draft — belum termasuk SQL migration

---

## Konvensi

- Nama tabel: `snake_case`, plural.
- Nama kolom: `snake_case`.
- Primary key: `id` bigint GENERATED ALWAYS AS IDENTITY pada seluruh tabel.
- Timestamps standar: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`.
- Soft delete: `deleted_at TIMESTAMPTZ NULL` pada tabel utama transaksional.
- Enum PostgreSQL dibuat sebagai tipe custom (`CREATE TYPE`).
- Decimal moneter: `NUMERIC(12,2)`.
- JSONB untuk data semi-terstruktur (jadwal, properties audit log).
- Seluruh Foreign Key menggunakan `ON DELETE RESTRICT` kecuali dinyatakan lain.

---

## 1. Tabel `roles`

**Tujuan:** Master data role pengguna sistem.

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `name` | `VARCHAR(50)` | NO | — | UNIQUE |
| `display_name` | `VARCHAR(100)` | NO | — | — |
| `description` | `TEXT` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_roles_name` pada `name` (sudah tercakup oleh UNIQUE constraint).

**Catatan:** Nilai awal yang di-seed: `admin`, `doctor`, `owner`.

---

## 2. Tabel `branches`

**Tujuan:** Master data cabang WSDC.

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `name` | `VARCHAR(150)` | NO | — | — |
| `code` | `VARCHAR(20)` | NO | — | UNIQUE |
| `address` | `TEXT` | NO | — | — |
| `phone` | `VARCHAR(20)` | YES | NULL | — |
| `is_active` | `BOOLEAN` | NO | `TRUE` | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_branches_code` pada `code` (UNIQUE constraint).
- `idx_branches_is_active` pada `is_active`.

---

## 3. Tabel `users`

**Tujuan:** Akun pengguna sistem untuk autentikasi dan otorisasi.

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `role_id` | `BIGINT` | NO | — | FK → `roles.id` RESTRICT |
| `branch_id` | `BIGINT` | YES | NULL | FK → `branches.id` RESTRICT |
| `name` | `VARCHAR(150)` | NO | — | — |
| `email` | `VARCHAR(200)` | NO | — | UNIQUE |
| `password` | `VARCHAR(255)` | NO | — | — |
| `is_active` | `BOOLEAN` | NO | `TRUE` | — |
| `email_verified_at` | `TIMESTAMPTZ` | YES | NULL | — |
| `remember_token` | `VARCHAR(100)` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `deleted_at` | `TIMESTAMPTZ` | YES | NULL | — |

**Index:**
- `idx_users_email` pada `email` (UNIQUE constraint).
- `idx_users_role_id` pada `role_id`.
- `idx_users_branch_id` pada `branch_id`.
- `idx_users_is_active` pada `is_active`.

---

## 4. Tabel `doctors`

**Tujuan:** Profil profesional dokter, terpisah dari akun `users`.

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `user_id` | `BIGINT` | NO | — | FK → `users.id` RESTRICT, UNIQUE |
| `name` | `VARCHAR(150)` | NO | — | — |
| `sip_number` | `VARCHAR(50)` | YES | NULL | — |
| `specialization` | `VARCHAR(100)` | YES | NULL | — |
| `signature_image_path` | `VARCHAR(500)` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_doctors_user_id` pada `user_id` (UNIQUE constraint).
- `idx_doctors_name` pada `name` (untuk filter/sort daftar dokter).

---

## 5. Tabel `doctor_branch` (Pivot)

**Tujuan:** Relasi many-to-many dokter dan cabang, termasuk jadwal praktik.

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `doctor_id` | `BIGINT` | NO | — | FK → `doctors.id` CASCADE |
| `branch_id` | `BIGINT` | NO | — | FK → `branches.id` CASCADE |
| `schedule` | `JSONB` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Constraint:**
- `uq_doctor_branch` UNIQUE `(doctor_id, branch_id)`.

**Index:**
- `idx_doctor_branch_doctor_id` pada `doctor_id`.
- `idx_doctor_branch_branch_id` pada `branch_id`.

**Format `schedule` (contoh JSONB):**
```json
{
  "days": ["monday", "wednesday", "friday"],
  "start_time": "08:00",
  "end_time": "12:00"
}
```

---

## 6. Tabel `patients`

**Tujuan:** Data identitas pasien, bersifat global lintas cabang.

**Custom Type yang dibutuhkan:**
```sql
CREATE TYPE gender_enum AS ENUM ('male', 'female');
```

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `home_branch_id` | `BIGINT` | NO | — | FK → `branches.id` RESTRICT |
| `medical_record_number` | `VARCHAR(30)` | NO | — | UNIQUE |
| `name` | `VARCHAR(200)` | NO | — | — |
| `nik` | `VARCHAR(16)` | YES | NULL | UNIQUE WHERE `nik IS NOT NULL` |
| `birth_place` | `VARCHAR(100)` | NO | — | — |
| `birth_date` | `DATE` | NO | — | — |
| `gender` | `gender_enum` | NO | — | — |
| `address` | `TEXT` | NO | — | — |
| `phone_number` | `VARCHAR(20)` | NO | — | — |
| `occupation` | `VARCHAR(100)` | YES | NULL | — |
| `guardian_name` | `VARCHAR(150)` | YES | NULL | — |
| `guardian_phone` | `VARCHAR(20)` | YES | NULL | — |
| `guardian_relation` | `VARCHAR(50)` | YES | NULL | — |
| `drug_allergies` | `TEXT` | YES | NULL | — |
| `systemic_conditions` | `TEXT` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `deleted_at` | `TIMESTAMPTZ` | YES | NULL | — |

**Index:**
- `idx_patients_medical_record_number` pada `medical_record_number` (UNIQUE).
- `idx_patients_phone_number` pada `phone_number`.
- `idx_patients_name_trgm` menggunakan `GIN(name gin_trgm_ops)` — membutuhkan ekstensi `pg_trgm` untuk full-text search berdasarkan nama.
- `idx_patients_home_branch_id` pada `home_branch_id`.
- `idx_patients_birth_date` pada `birth_date`.
- `uq_patients_nik_partial` UNIQUE INDEX WHERE `nik IS NOT NULL` (partial unique index).

**Catatan:** `medical_record_number` digenerate oleh aplikasi (bukan database) menggunakan sequence per cabang per tahun. Format: `{KODE_CABANG}-{YYYY}-{NNNNNN}`.

---

## 7. Tabel `appointments`

**Tujuan:** Penjadwalan kunjungan pasien dan manajemen antrian.

**Custom Type yang dibutuhkan:**
```sql
CREATE TYPE appointment_status_enum AS ENUM (
  'scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'
);
```

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `patient_id` | `BIGINT` | NO | — | FK → `patients.id` RESTRICT |
| `doctor_id` | `BIGINT` | NO | — | FK → `doctors.id` RESTRICT |
| `branch_id` | `BIGINT` | NO | — | FK → `branches.id` RESTRICT |
| `created_by` | `BIGINT` | NO | — | FK → `users.id` RESTRICT |
| `appointment_date` | `DATE` | NO | — | — |
| `appointment_time` | `TIME` | YES | NULL | — |
| `status` | `appointment_status_enum` | NO | `'scheduled'` | — |
| `notes` | `TEXT` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `deleted_at` | `TIMESTAMPTZ` | YES | NULL | — |

**Index:**
- `idx_appointments_patient_id` pada `patient_id`.
- `idx_appointments_doctor_id` pada `doctor_id`.
- `idx_appointments_branch_id` pada `branch_id`.
- `idx_appointments_date` pada `appointment_date`.
- `idx_appointments_status` pada `status`.
- `idx_appointments_branch_date` composite pada `(branch_id, appointment_date)` — untuk query "daftar kunjungan hari ini per cabang".

---

## 8. Tabel `medical_records`

**Tujuan:** Tabel induk satu kunjungan pemeriksaan pasien (agregat rekam medis).

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `patient_id` | `BIGINT` | NO | — | FK → `patients.id` RESTRICT |
| `doctor_id` | `BIGINT` | NO | — | FK → `doctors.id` RESTRICT |
| `branch_id` | `BIGINT` | NO | — | FK → `branches.id` RESTRICT |
| `appointment_id` | `BIGINT` | YES | NULL | FK → `appointments.id` RESTRICT, UNIQUE WHERE NOT NULL |
| `visit_date` | `DATE` | NO | — | — |
| `anamnesis` | `TEXT` | NO | — | — |
| `additional_notes` | `TEXT` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `deleted_at` | `TIMESTAMPTZ` | YES | NULL | — |

**Index:**
- `idx_medical_records_patient_id` pada `patient_id`.
- `idx_medical_records_doctor_id` pada `doctor_id`.
- `idx_medical_records_branch_id` pada `branch_id`.
- `idx_medical_records_visit_date` pada `visit_date`.
- `idx_medical_records_appointment_id` pada `appointment_id`.
- `idx_medical_records_patient_date` composite pada `(patient_id, visit_date DESC)` — untuk riwayat kunjungan pasien terurut kronologis.

**Constraint Tambahan:**
- `uq_medical_records_appointment_id` UNIQUE WHERE `appointment_id IS NOT NULL` — satu appointment hanya menghasilkan satu rekam medis.

---

## 9. Tabel `diagnoses`

**Tujuan:** Diagnosa per rekam medis (multi-diagnosa per kunjungan).

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `medical_record_id` | `BIGINT` | NO | — | FK → `medical_records.id` CASCADE |
| `diagnosis_code` | `VARCHAR(20)` | YES | NULL | — |
| `diagnosis_name` | `VARCHAR(300)` | NO | — | — |
| `tooth_number` | `VARCHAR(10)` | YES | NULL | — |
| `notes` | `TEXT` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_diagnoses_medical_record_id` pada `medical_record_id`.

**Catatan:** FK menggunakan `CASCADE` — jika rekam medis di-hard-delete, diagnosa ikut terhapus. Dalam praktik, `deleted_at` pada `medical_records` digunakan (soft delete), sehingga CASCADE jarang terpicu.

---

## 10. Tabel `treatment_masters`

**Tujuan:** Master data jenis tindakan dan tarif standar.

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `branch_id` | `BIGINT` | YES | NULL | FK → `branches.id` RESTRICT |
| `name` | `VARCHAR(200)` | NO | — | — |
| `default_price` | `NUMERIC(12,2)` | NO | — | CHECK `(default_price >= 0)` |
| `is_active` | `BOOLEAN` | NO | `TRUE` | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_treatment_masters_branch_id` pada `branch_id`.
- `idx_treatment_masters_is_active` pada `is_active`.
- `idx_treatment_masters_name` pada `name`.

**Catatan:** `branch_id NULL` berarti tarif berlaku global untuk semua cabang. `branch_id` terisi berarti tarif khusus cabang tersebut.

---

## 11. Tabel `treatments`

**Tujuan:** Tindakan medis yang dilakukan pada satu kunjungan (snapshot dari master tindakan).

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `medical_record_id` | `BIGINT` | NO | — | FK → `medical_records.id` CASCADE |
| `treatment_master_id` | `BIGINT` | YES | NULL | FK → `treatment_masters.id` SET NULL |
| `name` | `VARCHAR(200)` | NO | — | — |
| `tooth_number` | `VARCHAR(10)` | YES | NULL | — |
| `price` | `NUMERIC(12,2)` | NO | — | CHECK `(price >= 0)` |
| `notes` | `TEXT` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_treatments_medical_record_id` pada `medical_record_id`.
- `idx_treatments_treatment_master_id` pada `treatment_master_id`.

**Catatan Penting:** FK `treatment_master_id` menggunakan `SET NULL` (bukan CASCADE/RESTRICT) agar penghapusan master tindakan tidak memblokir atau menghapus histori tindakan yang sudah tercatat. Kolom `name` dan `price` adalah **snapshot** — tidak berubah meski master diupdate.

---

## 12. Tabel `prescriptions`

**Tujuan:** Resep obat per rekam medis (multi-obat per kunjungan).

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `medical_record_id` | `BIGINT` | NO | — | FK → `medical_records.id` CASCADE |
| `medicine_name` | `VARCHAR(200)` | NO | — | — |
| `dosage` | `VARCHAR(50)` | NO | — | — |
| `frequency` | `VARCHAR(100)` | NO | — | — |
| `quantity` | `SMALLINT` | NO | — | CHECK `(quantity > 0)` |
| `notes` | `TEXT` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_prescriptions_medical_record_id` pada `medical_record_id`.

---

## 13. Tabel `odontogram_conditions`

**Tujuan:** Master data kondisi gigi untuk konsistensi rendering odontogram di frontend.

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `code` | `VARCHAR(30)` | NO | — | UNIQUE |
| `display_name` | `VARCHAR(100)` | NO | — | — |
| `symbol` | `VARCHAR(10)` | YES | NULL | — |
| `color` | `VARCHAR(20)` | YES | NULL | — |
| `is_active` | `BOOLEAN` | NO | `TRUE` | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_odontogram_conditions_code` pada `code` (UNIQUE).
- `idx_odontogram_conditions_is_active` pada `is_active`.

---

## 14. Tabel `odontograms`

**Tujuan:** Kondisi setiap gigi pada satu kunjungan (snapshot historis per rekam medis).

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `medical_record_id` | `BIGINT` | NO | — | FK → `medical_records.id` CASCADE |
| `odontogram_condition_id` | `BIGINT` | YES | NULL | FK → `odontogram_conditions.id` RESTRICT |
| `tooth_number` | `VARCHAR(5)` | NO | — | — |
| `condition_code` | `VARCHAR(30)` | NO | — | — |
| `notes` | `TEXT` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Constraint:**
- `uq_odontogram_tooth` UNIQUE `(medical_record_id, tooth_number)` — satu gigi satu entri per kunjungan.

**Index:**
- `idx_odontograms_medical_record_id` pada `medical_record_id`.

**Catatan:** `condition_code` adalah snapshot string (redundan dengan FK ke `odontogram_conditions`) untuk keamanan data historis. Nilai `tooth_number` menggunakan notasi FDI dua digit (misal: `11`, `46`, `85`).

---

## 15. Tabel `patient_photos`

**Tujuan:** Metadata foto medis pasien yang terkait rekam medis.

**Custom Type yang dibutuhkan:**
```sql
CREATE TYPE photo_type_enum AS ENUM (
  'clinical_photo', 'xray', 'before', 'after', 'other'
);
```

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `medical_record_id` | `BIGINT` | NO | — | FK → `medical_records.id` RESTRICT |
| `patient_id` | `BIGINT` | NO | — | FK → `patients.id` RESTRICT |
| `uploaded_by` | `BIGINT` | NO | — | FK → `users.id` RESTRICT |
| `file_path` | `VARCHAR(500)` | NO | — | — |
| `file_url` | `VARCHAR(500)` | YES | NULL | — |
| `file_type` | `photo_type_enum` | NO | `'clinical_photo'` | — |
| `caption` | `VARCHAR(255)` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `deleted_at` | `TIMESTAMPTZ` | YES | NULL | — |

**Index:**
- `idx_patient_photos_medical_record_id` pada `medical_record_id`.
- `idx_patient_photos_patient_id` pada `patient_id`.

---

## 16. Tabel `payments`

**Tujuan:** Header transaksi pembayaran kunjungan pasien.

**Custom Type yang dibutuhkan:**
```sql
CREATE TYPE payment_method_enum AS ENUM ('cash', 'transfer');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'partial', 'cancelled');
CREATE TYPE discount_type_enum AS ENUM ('percentage', 'nominal');
```

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `medical_record_id` | `BIGINT` | NO | — | FK → `medical_records.id` RESTRICT, UNIQUE |
| `patient_id` | `BIGINT` | NO | — | FK → `patients.id` RESTRICT |
| `branch_id` | `BIGINT` | NO | — | FK → `branches.id` RESTRICT |
| `doctor_id` | `BIGINT` | NO | — | FK → `doctors.id` RESTRICT |
| `created_by` | `BIGINT` | NO | — | FK → `users.id` RESTRICT |
| `invoice_number` | `VARCHAR(40)` | NO | — | UNIQUE |
| `payment_method` | `payment_method_enum` | NO | — | — |
| `total_amount` | `NUMERIC(12,2)` | NO | — | CHECK `(total_amount >= 0)` |
| `discount_type` | `discount_type_enum` | YES | NULL | — |
| `discount_value` | `NUMERIC(12,2)` | YES | NULL | CHECK `(discount_value >= 0)` |
| `discount_amount` | `NUMERIC(12,2)` | NO | `0` | CHECK `(discount_amount >= 0)` |
| `final_amount` | `NUMERIC(12,2)` | NO | — | CHECK `(final_amount >= 0)` |
| `paid_amount` | `NUMERIC(12,2)` | NO | `0` | CHECK `(paid_amount >= 0)` |
| `status` | `payment_status_enum` | NO | `'pending'` | — |
| `paid_at` | `TIMESTAMPTZ` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `deleted_at` | `TIMESTAMPTZ` | YES | NULL | — |

**Constraint:**
- `uq_payments_medical_record_id` UNIQUE pada `medical_record_id` (satu rekam medis satu pembayaran pada tahap awal).
- `chk_payments_amounts` CHECK `(final_amount = total_amount - discount_amount)`.

**Index:**
- `idx_payments_medical_record_id` pada `medical_record_id`.
- `idx_payments_patient_id` pada `patient_id`.
- `idx_payments_branch_id` pada `branch_id`.
- `idx_payments_doctor_id` pada `doctor_id`.
- `idx_payments_status` pada `status`.
- `idx_payments_paid_at` pada `paid_at` — kritis untuk query laporan pendapatan.
- `idx_payments_branch_paid_at` composite pada `(branch_id, paid_at)` — untuk laporan per cabang.
- `idx_payments_doctor_paid_at` composite pada `(doctor_id, paid_at)` — untuk laporan per dokter.
- `idx_payments_invoice_number` pada `invoice_number` (UNIQUE).

---

## 17. Tabel `payment_details`

**Tujuan:** Rincian item (tindakan) yang dibayar dalam satu transaksi.

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `payment_id` | `BIGINT` | NO | — | FK → `payments.id` CASCADE |
| `treatment_id` | `BIGINT` | NO | — | FK → `treatments.id` RESTRICT |
| `description` | `VARCHAR(200)` | NO | — | — |
| `price` | `NUMERIC(12,2)` | NO | — | CHECK `(price >= 0)` |
| `quantity` | `SMALLINT` | NO | `1` | CHECK `(quantity > 0)` |
| `subtotal` | `NUMERIC(12,2)` | NO | — | CHECK `(subtotal = price * quantity)` |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_payment_details_payment_id` pada `payment_id`.
- `idx_payment_details_treatment_id` pada `treatment_id`.

---

## 18. Tabel `activity_logs`

**Tujuan:** Audit trail perubahan pada data sensitif (rekam medis, pembayaran, pasien).

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `log_name` | `VARCHAR(100)` | YES | `'default'` | — |
| `description` | `TEXT` | NO | — | — |
| `subject_type` | `VARCHAR(200)` | YES | NULL | — |
| `subject_id` | `BIGINT` | YES | NULL | — |
| `causer_type` | `VARCHAR(200)` | YES | NULL | — |
| `causer_id` | `BIGINT` | YES | NULL | — |
| `event` | `VARCHAR(50)` | YES | NULL | — |
| `properties` | `JSONB` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_activity_logs_subject` composite pada `(subject_type, subject_id)` — untuk query histori perubahan per entitas.
- `idx_activity_logs_causer` composite pada `(causer_type, causer_id)` — untuk query aktivitas per user.
- `idx_activity_logs_log_name` pada `log_name`.
- `idx_activity_logs_created_at` pada `created_at`.

---

## 19. Tabel `personal_access_tokens` (Laravel Sanctum — standar)

**Tujuan:** Menyimpan token autentikasi Sanctum. Digenerate otomatis oleh framework.

| Kolom | Tipe Data | Nullable | Default | Constraint |
|---|---|---|---|---|
| `id` | `BIGINT` | NO | IDENTITY | PK |
| `tokenable_type` | `VARCHAR(255)` | NO | — | — |
| `tokenable_id` | `BIGINT` | NO | — | — |
| `name` | `VARCHAR(255)` | NO | — | — |
| `token` | `VARCHAR(64)` | NO | — | UNIQUE |
| `abilities` | `TEXT` | YES | NULL | — |
| `last_used_at` | `TIMESTAMPTZ` | YES | NULL | — |
| `expires_at` | `TIMESTAMPTZ` | YES | NULL | — |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |
| `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | — |

**Index:**
- `idx_personal_access_tokens_tokenable` composite pada `(tokenable_type, tokenable_id)`.

---

## 20. Ringkasan Index Rekomendasi

| Tabel | Index | Tipe | Tujuan |
|---|---|---|---|
| `patients` | `(phone_number)` | BTREE | Pencarian cepat via nomor HP |
| `patients` | `(name) GIN gin_trgm_ops` | GIN | Full-text search nama pasien |
| `patients` | `nik WHERE nik IS NOT NULL` | BTREE PARTIAL | Partial unique, validasi NIK |
| `appointments` | `(branch_id, appointment_date)` | BTREE COMPOSITE | Query daftar kunjungan harian per cabang |
| `medical_records` | `(patient_id, visit_date DESC)` | BTREE COMPOSITE | Riwayat kunjungan pasien kronologis |
| `payments` | `(branch_id, paid_at)` | BTREE COMPOSITE | Laporan pendapatan per cabang |
| `payments` | `(doctor_id, paid_at)` | BTREE COMPOSITE | Laporan pendapatan per dokter |
| `payments` | `(status, paid_at)` | BTREE COMPOSITE | Filter laporan berdasarkan status |
| `odontograms` | `(medical_record_id, tooth_number)` | BTREE COMPOSITE | Unique per gigi per kunjungan |
| `activity_logs` | `(subject_type, subject_id)` | BTREE COMPOSITE | Audit trail per entitas |

---

## 21. Ekstensi PostgreSQL yang Dibutuhkan

| Ekstensi | Tujuan |
|---|---|
| `pg_trgm` | Mendukung full-text search trigram pada kolom `patients.name` |
| `uuid-ossp` | (Opsional) Jika UUID digunakan sebagai public identifier tambahan di masa depan |

```sql
-- Dijalankan sekali saat inisialisasi database:
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## 22. Urutan Pembuatan Tabel (Dependency Order)

Urutan ini diperlukan agar foreign key constraint tidak gagal saat migrasi:

1. `roles`
2. `branches`
3. `users` (dep: roles, branches)
4. `doctors` (dep: users)
5. `doctor_branch` (dep: doctors, branches)
6. `odontogram_conditions`
7. `patients` (dep: branches)
8. `treatment_masters` (dep: branches)
9. `appointments` (dep: patients, doctors, branches, users)
10. `medical_records` (dep: patients, doctors, branches, appointments)
11. `diagnoses` (dep: medical_records)
12. `treatments` (dep: medical_records, treatment_masters)
13. `prescriptions` (dep: medical_records)
14. `odontograms` (dep: medical_records, odontogram_conditions)
15. `patient_photos` (dep: medical_records, patients, users)
16. `payments` (dep: medical_records, patients, branches, doctors, users)
17. `payment_details` (dep: payments, treatments)
18. `activity_logs`
19. `personal_access_tokens` (migrasi Sanctum, dep: users)

---

*Dokumen ini adalah referensi schema sebelum SQL migration di-generate. Setiap perubahan keputusan dari `gap-analysis.md` yang belum direspon (CR-01, MDE-02, MR-06) harus direfleksikan di dokumen ini sebelum migration scripts dibuat.*
