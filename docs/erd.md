# Entity Relationship Diagram — Widya Santi Dental Care (WSDC)

**Versi Dokumen:** 1.0  
**Tanggal:** 15 Juni 2026  
**Sumber:** `frontend.md` v1.0 + `backend.md` v1.0 + `gap-analysis.md` v1.0  
**Audience:** Database Engineer, Backend Developer, System Architect  
**Status:** Draft — pending konfirmasi poin CR-01, MDE-02 (lihat gap-analysis.md)

---

## 1. Conceptual ERD

Tingkat konseptual menunjukkan entitas utama dan hubungan bisnisnya tanpa detail teknis.

```
┌──────────┐          ┌──────────┐          ┌──────────────┐
│   ROLE   │ 1      * │   USER   │ *      1 │    BRANCH    │
└──────────┘          └──────────┘          └──────────────┘
                           │ 1                      │ 1
                           │                        │
                           │ 1                 *    │ *
                      ┌────┴──────┐       ┌─────────┴──────┐
                      │  DOCTOR   │ *---* │  DOCTOR_BRANCH │
                      └────┬──────┘       │  (w/ schedule) │
                           │              └────────────────┘
                           │ 1
                    *      │
┌──────────┐     ┌─────────┴───────┐
│ PATIENT  │ 1 * │  APPOINTMENT    │
└────┬─────┘     └────────┬────────┘
     │ 1                  │ 0..1
     │                    │
     │ 1            ┌─────┴────────────┐
     └───────────── │  MEDICAL RECORD  │
           *        └──┬───┬──┬──┬──┬─┘
                       │   │  │  │  │
              ┌────────┘   │  │  │  └───────────┐
              │        ┌───┘  │  └──────┐        │
              ▼        ▼      ▼         ▼         ▼
         DIAGNOSIS TREATMENT PRESCRIPTION ODONTOGRAM PHOTO
              │        │
              │        │ *
              │   ┌────┴──────────┐
              │   │TREATMENT_MSTR │
              │   └───────────────┘
              │
         ┌────┴──────────────┐
         │     PAYMENT       │
         └────────┬──────────┘
                  │ 1
                  │ *
           ┌──────┴──────────┐
           │  PAYMENT_DETAIL │
           └─────────────────┘
```

**Catatan tambahan dari gap-analysis.md:**
- `PATIENT` memiliki atribut medis permanen (alergi, kondisi sistemik) — MDE-02.
- `AUDIT_LOG` mencatat seluruh perubahan pada entitas sensitif — MDE-03.
- `ODONTOGRAM_CONDITION` sebagai master data kondisi gigi — MR-06.

---

## 2. Logical ERD

Tingkat logis menampilkan seluruh entitas, atribut kunci, dan kardinalitas relasi.

```
┌──────────────────────────────────────────────────────────────────┐
│ ROLES                                                            │
│  PK  id                                                          │
│      name (unique)                                               │
│      display_name                                                │
│      description                                                 │
└───────────────────────────────┬──────────────────────────────────┘
                                │ 1
                                │
                                │ *
┌──────────────────────────────────────────────────────────────────┐
│ USERS                                                            │
│  PK  id                                                          │
│  FK  role_id → roles.id                                          │
│  FK  branch_id → branches.id (nullable)                          │
│      name                                                        │
│      email (unique)                                              │
│      password                                                    │
│      is_active                                                   │
│      email_verified_at                                           │
│      remember_token                                              │
│      created_at, updated_at, deleted_at                          │
└──────────┬──────────────────────────┬───────────────────────────-┘
           │ 1                        │ 1
           │                          │
           │ 0..1                     │ *
┌──────────┴──────────┐   ┌──────────┴─────────────────────────────┐
│ DOCTORS             │   │ BRANCHES                               │
│  PK  id             │   │  PK  id                                │
│  FK  user_id(unique)│   │      name                              │
│      name           │   │      code (unique)                     │
│      sip_number     │   │      address                           │
│      specialization │   │      phone                             │
│      signature_path │   │      is_active                         │
│      created_at     │   │      created_at, updated_at             │
│      updated_at     │   └─────┬──────────────────────────────────┘
└──────┬──────────────┘         │
       │ *                      │ *
       │                        │
       └────────────┐           │
                    ▼           ▼
┌──────────────────────────────────────────────────────────────────┐
│ DOCTOR_BRANCH  (pivot)                                           │
│  PK  id                                                          │
│  FK  doctor_id → doctors.id                                      │
│  FK  branch_id → branches.id                                     │
│      schedule (jsonb, nullable)                                  │
│  UQ  (doctor_id, branch_id)                                      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ PATIENTS                                                         │
│  PK  id                                                          │
│  FK  home_branch_id → branches.id                                │
│      medical_record_number (unique)                              │
│      name                                                        │
│      nik (nullable, unique partial)                              │
│      birth_place                                                 │
│      birth_date                                                  │
│      gender (enum: male, female)                                 │
│      address                                                     │
│      phone_number (indexed)                                      │
│      occupation (nullable)                                       │
│      guardian_name (nullable)      ← dari MR-03                 │
│      guardian_phone (nullable)     ← dari MR-03                 │
│      guardian_relation (nullable)  ← dari MR-03                 │
│      drug_allergies (text, nullable)       ← dari MDE-02        │
│      systemic_conditions (text, nullable)  ← dari MDE-02        │
│      created_at, updated_at, deleted_at                          │
└──────┬───────────────────────────────────────────────────────────┘
       │ 1
       ├────────────────────────────────────────┐
       │ *                                      │ *
┌──────┴────────────────────┐      ┌────────────┴──────────────────┐
│ APPOINTMENTS              │      │ PATIENT_PHOTOS                │
│  PK  id                   │      │  PK  id                       │
│  FK  patient_id           │      │  FK  medical_record_id        │
│  FK  doctor_id            │      │  FK  patient_id               │
│  FK  branch_id            │      │  FK  uploaded_by → users.id   │
│  FK  created_by → users.id│      │      file_path                │
│      appointment_date     │      │      file_url (nullable)      │
│      appointment_time     │      │      file_type                │
│      status (enum)        │      │      caption (nullable)       │
│      notes (nullable)     │      │      created_at, deleted_at   │
│      created_at, updated_at│     └───────────────────────────────┘
│      deleted_at           │
└──────┬────────────────────┘
       │ 0..1
       │
       │ 1
┌──────┴────────────────────────────────────────────────────────────┐
│ MEDICAL_RECORDS                                                   │
│  PK  id                                                           │
│  FK  patient_id → patients.id                                     │
│  FK  doctor_id → doctors.id                                       │
│  FK  branch_id → branches.id                                      │
│  FK  appointment_id → appointments.id (nullable)                  │
│      visit_date                                                   │
│      anamnesis (text)                                             │
│      additional_notes (text, nullable)                            │
│      created_at, updated_at, deleted_at                           │
└──────┬────────────────────────────────────────────────────────────┘
       │ 1
       ├───────────────┬────────────────┬────────────────┬──────────┐
       │ *             │ *              │ *              │ *        │ *
┌──────┴─────┐  ┌──────┴─────┐  ┌──────┴────┐  ┌───────┴───┐  ┌───┴──────────┐
│ DIAGNOSES  │  │ TREATMENTS │  │PRESCRIPTS │  │ODONTOGRAMS│  │PATIENT_PHOTOS│
│ PK id      │  │ PK id      │  │ PK id     │  │ PK id     │  │(see above)   │
│ FK mr_id   │  │ FK mr_id   │  │ FK mr_id  │  │ FK mr_id  │  └──────────────┘
│ diag_code  │  │ FK tm_id   │  │ med_name  │  │tooth_num  │
│ diag_name  │  │   (nullable│  │ dosage    │  │cond_code  │
│ tooth_num  │  │ tooth_num  │  │ frequency │  │FK cond_id │
│ notes      │  │ name       │  │ quantity  │  │ notes     │
│ created_at │  │ price      │  │ notes     │  │ created_at│
└────────────┘  │ notes      │  │ created_at│  └───────────┘
                │ created_at │  └───────────┘
                └──────┬─────┘
                       │ *
                       │ 1
         ┌─────────────┴─────────────────────────────────┐
         │ TREATMENT_MASTERS                              │
         │  PK  id                                        │
         │  FK  branch_id → branches.id (nullable)        │
         │      name                                      │
         │      default_price                             │
         │      is_active                                 │
         │      created_at, updated_at                    │
         └───────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ PAYMENTS                                                         │
│  PK  id                                                          │
│  FK  medical_record_id → medical_records.id                      │
│  FK  patient_id → patients.id (denorm)                           │
│  FK  branch_id → branches.id (denorm)                            │
│  FK  doctor_id → doctors.id (denorm)                             │
│  FK  created_by → users.id                                       │
│      invoice_number (unique)                                     │
│      payment_method (enum: cash, transfer)                       │
│      total_amount                                                │
│      discount_type (enum: percentage, nominal, nullable) ←MR-07 │
│      discount_value (decimal, nullable)              ← MR-07     │
│      discount_amount (decimal, default 0)                        │
│      final_amount                                                │
│      paid_amount                                                 │
│      status (enum: pending, paid, partial, cancelled)            │
│      paid_at (nullable)                                          │
│      created_at, updated_at, deleted_at                          │
└──────┬───────────────────────────────────────────────────────────┘
       │ 1
       │ *
┌──────┴─────────────────────────────────────────────────────────┐
│ PAYMENT_DETAILS                                                 │
│  PK  id                                                         │
│  FK  payment_id → payments.id                                   │
│  FK  treatment_id → treatments.id                               │
│      description                                                │
│      price                                                      │
│      quantity (default 1)                                       │
│      subtotal                                                   │
│      created_at                                                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ ODONTOGRAM_CONDITIONS  (master data)             ← MR-06        │
│  PK  id                                                          │
│      code (unique)                                               │
│      display_name                                                │
│      symbol (varchar, nullable)                                  │
│      color (varchar, nullable)                                   │
│      is_active                                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ ACTIVITY_LOGS  (audit log)                       ← MDE-03       │
│  PK  id                                                          │
│  FK  user_id → users.id (nullable)                               │
│      log_name (varchar)                                          │
│      description (text)                                          │
│      subject_type (varchar)                                      │
│      subject_id (bigint)                                         │
│      causer_type (varchar, nullable)                             │
│      causer_id (bigint, nullable)                                │
│      properties (jsonb, nullable)                                │
│      created_at                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Penjelasan Setiap Tabel

### 3.1 `roles`

Menyimpan daftar role sistem secara dinamis. Pemisahan dari kolom enum pada `users` memberikan fleksibilitas penambahan role baru (misalnya Resepsionis, Perawat, Super Admin) tanpa perlu migrasi kolom enum.

**Kardinalitas:**
- Satu `role` dimiliki oleh banyak `users` (1:N).

---

### 3.2 `users`

Entitas autentikasi utama. Setiap pengguna sistem — Admin, Dokter, Owner — memiliki satu baris pada tabel ini. Kolom `branch_id` nullable karena Owner tidak terikat ke satu cabang. Pengguna dengan role Dokter memiliki satu baris terkait di tabel `doctors` yang menyimpan atribut profesional.

**Kardinalitas:**
- Satu `user` memiliki satu `role` (N:1).
- Satu `user` terkait ke satu `branch` (N:1, nullable untuk Owner).
- Satu `user` dengan role Dokter memiliki satu `doctor` profile (1:1).

**Catatan:** Kolom `deleted_at` (soft delete) memastikan akun yang dinonaktifkan tidak hilang dari histori audit.

---

### 3.3 `branches`

Master data 3 cabang WSDC. Kolom `code` digunakan sebagai prefix pada generate nomor rekam medis dan nomor kwitansi secara otomatis. `is_active` memungkinkan cabang dinonaktifkan tanpa menghapus data historis.

**Kardinalitas:**
- Satu `branch` memiliki banyak `users` (1:N).
- Satu `branch` memiliki banyak `patients` sebagai `home_branch` (1:N).
- Satu `branch` terkait ke banyak `doctors` melalui tabel pivot (M:N).
- Satu `branch` memiliki banyak `appointments`, `medical_records`, `payments` (1:N masing-masing).

---

### 3.4 `doctors`

Profil profesional dokter, dipisah dari `users` agar atribut medis (SIP, spesialisasi) tidak mencempur dengan data akun. Satu dokter dapat bertugas di lebih dari satu cabang melalui tabel pivot `doctor_branch`.

**Kardinalitas:**
- Satu `doctor` memiliki satu `user` (1:1).
- Satu `doctor` terkait ke banyak `branches` melalui pivot (M:N).
- Satu `doctor` memiliki banyak `appointments` (1:N).
- Satu `doctor` memiliki banyak `medical_records` (1:N).

---

### 3.5 `doctor_branch` (pivot)

Tabel junction many-to-many antara `doctors` dan `branches`. Kolom `schedule` tipe JSONB menyimpan jadwal praktik dokter per cabang secara fleksibel (hari dan jam). Unique constraint pada `(doctor_id, branch_id)` mencegah duplikasi penugasan.

---

### 3.6 `patients`

Entitas inti klinik. Bersifat **global** — satu baris per pasien untuk seluruh cabang. `home_branch_id` hanya menandai cabang tempat pasien pertama kali terdaftar, bukan membatasi akses cabang lain.

Kolom tambahan dari gap analysis:
- `guardian_name/phone/relation` (nullable) — untuk pasien anak.
- `drug_allergies` (text, nullable) — peringatan alergi obat untuk dokter.
- `systemic_conditions` (text, nullable) — kondisi sistemik relevan (diabetes, hipertensi).
- `medical_record_number` — digenerate otomatis, format `{KODE_CABANG}-{YYYY}-{NNNNNN}`.

**Kardinalitas:**
- Satu `patient` memiliki banyak `appointments` (1:N).
- Satu `patient` memiliki banyak `medical_records` (1:N).
- Satu `patient` memiliki banyak `patient_photos` (1:N, denormalized).

---

### 3.7 `appointments`

Merepresentasikan jadwal kunjungan pasien. Mendukung pasien walk-in (`appointment_time` nullable) dan pasien dengan booking (`appointment_date` + `appointment_time` terisi). Status kunjungan mengikuti lifecycle: `scheduled` → `checked_in` → `in_progress` → `completed` (atau `cancelled` / `no_show`).

**Kardinalitas:**
- Satu `appointment` dimiliki oleh satu `patient` (N:1).
- Satu `appointment` ditangani oleh satu `doctor` (N:1).
- Satu `appointment` terjadi di satu `branch` (N:1).
- Satu `appointment` dapat menghasilkan nol atau satu `medical_record` (1:0..1).

---

### 3.8 `medical_records`

Tabel agregat yang merepresentasikan **satu kunjungan pemeriksaan**. Menjadi parent dari seluruh sub-entitas klinis: diagnosa, tindakan, resep, odontogram, dan foto. `appointment_id` nullable untuk mendukung walk-in tanpa booking.

**Kardinalitas:**
- Satu `medical_record` dimiliki oleh satu `patient` (N:1).
- Satu `medical_record` ditangani oleh satu `doctor` (N:1).
- Satu `medical_record` terjadi di satu `branch` (N:1).
- Satu `medical_record` berasal dari nol atau satu `appointment` (N:0..1).
- Satu `medical_record` memiliki banyak `diagnoses`, `treatments`, `prescriptions`, `odontograms`, `patient_photos` (1:N masing-masing).
- Satu `medical_record` memiliki nol atau satu `payment` (1:0..1 pada tahap awal).

---

### 3.9 `diagnoses`

Sub-entitas rekam medis untuk mencatat diagnosa. Satu kunjungan dapat memiliki lebih dari satu diagnosa (multi-diagnosa). Kolom `diagnosis_code` nullable untuk mendukung penggunaan ICD-10 jika dikonfirmasi, atau tetap kosong jika klinik menggunakan istilah bebas.

**Kardinalitas:**
- Banyak `diagnoses` dimiliki oleh satu `medical_record` (N:1).

---

### 3.10 `treatments`

Sub-entitas rekam medis untuk mencatat tindakan medis. Mendukung multi-tindakan per kunjungan. Kolom `name` dan `price` disimpan sebagai **snapshot** dari `treatment_masters` untuk menjaga integritas data historis — perubahan tarif master tidak mengubah data tindakan yang sudah tersimpan.

**Kardinalitas:**
- Banyak `treatments` dimiliki oleh satu `medical_record` (N:1).
- Satu `treatment` merujuk ke nol atau satu `treatment_master` (N:0..1).
- Satu `treatment` terkait ke banyak `payment_details` (1:N).

---

### 3.11 `prescriptions`

Sub-entitas rekam medis untuk mencatat resep obat. Mendukung multi-obat per kunjungan (satu baris per obat). Tidak terhubung ke master data obat pada tahap awal — nama obat dicatat sebagai teks bebas.

**Kardinalitas:**
- Banyak `prescriptions` dimiliki oleh satu `medical_record` (N:1).

---

### 3.12 `odontograms`

Sub-entitas rekam medis untuk merepresentasikan kondisi gigi pasien. Setiap baris merepresentasikan satu gigi dengan kondisinya. Pendekatan **historis per kunjungan** — setiap kunjungan menghasilkan snapshot odontogram baru. `condition_code` merujuk ke `odontogram_conditions` untuk konsistensi simbol dan warna pada UI.

**Kardinalitas:**
- Banyak `odontograms` (maks. 32 baris per kunjungan dewasa) dimiliki oleh satu `medical_record` (N:1).

---

### 3.13 `patient_photos`

Menyimpan metadata foto medis pasien. File fisik disimpan di Cloudflare R2 (production) atau local storage (development). `file_type` mengkategorikan foto: `clinical_photo`, `xray`, `before`, `after`. Kolom `patient_id` denormalized untuk query riwayat foto pasien tanpa join berlapis.

**Kardinalitas:**
- Banyak `patient_photos` dimiliki oleh satu `medical_record` (N:1).
- Banyak `patient_photos` dimiliki oleh satu `patient` (N:1, denormalized).

---

### 3.14 `treatment_masters`

Master data tindakan dan tarif. Kolom `branch_id` nullable mendukung tarif berbeda per cabang. Jika `branch_id` null, tarif bersifat global. `is_active` memungkinkan tindakan dinonaktifkan dari daftar pilihan tanpa menghapus histori.

**Kardinalitas:**
- Satu `treatment_master` terkait ke satu `branch` atau global (N:0..1).
- Satu `treatment_master` dirujuk oleh banyak `treatments` (1:N).

---

### 3.15 `payments`

Header transaksi pembayaran. Menyimpan kolom denormalized (`patient_id`, `branch_id`, `doctor_id`) yang dapat diturunkan dari `medical_record_id` — dipertahankan untuk mengoptimalkan query laporan tanpa join berlapis. `invoice_number` digenerate otomatis dengan format terstandar. Kolom diskon ditambahkan dari gap analysis (MR-07): `discount_type` dan `discount_value`.

**Kardinalitas:**
- Satu `payment` terkait ke satu `medical_record` (N:1, unique pada tahap awal).
- Satu `payment` memiliki banyak `payment_details` (1:N).

---

### 3.16 `payment_details`

Rincian item yang dibayar dalam satu transaksi. Setiap baris merujuk ke satu `treatment`. Kolom `description` dan `price` adalah snapshot dari `treatment` pada saat pembayaran.

**Kardinalitas:**
- Banyak `payment_details` dimiliki oleh satu `payment` (N:1).
- Satu `payment_detail` terkait ke satu `treatment` (N:1).

---

### 3.17 `odontogram_conditions` (Master Data)

Master data kondisi gigi untuk mendukung konsistensi rendering odontogram di frontend. Setiap kondisi memiliki kode, nama tampilan, simbol, dan warna (format hex atau nama warna CSS). Harus diisi berdasarkan hasil diskusi dengan dokter klinik (MR-06).

Contoh data:

| code | display_name | symbol | color |
|---|---|---|---|
| `healthy` | Sehat | — | `#4CAF50` |
| `caries` | Karies | C | `#F44336` |
| `filled_composite` | Tambalan Komposit | FC | `#2196F3` |
| `filled_amalgam` | Tambalan Amalgam | FA | `#9E9E9E` |
| `missing` | Gigi Hilang | X | `#000000` |
| `extraction_needed` | Akan Dicabut | E | `#FF9800` |
| `root_canal` | PSA (Perawatan Saluran Akar) | PSA | `#9C27B0` |
| `crown` | Mahkota | CR | `#FFEB3B` |
| `bridge` | Gigi Tiruan Jembatan | BR | `#795548` |
| `implant` | Implan | I | `#607D8B` |

---

### 3.18 `activity_logs` (Audit Log)

Mencatat setiap perubahan pada entitas sensitif: `medical_records`, `payments`, `patients`, `users`. Menggunakan struktur polimorfik (`subject_type` + `subject_id`) untuk mendukung logging multi-model. Kolom `properties` tipe JSONB menyimpan nilai sebelum dan sesudah perubahan.

**Kardinalitas:**
- Setiap log terkait ke satu `user` sebagai pelaku (N:0..1, nullable untuk operasi sistem).

---

## 4. Ringkasan Kardinalitas Antar Entitas

| Entitas A | Kardinalitas | Entitas B | Keterangan |
|---|---|---|---|
| roles | 1 : N | users | Satu role dimiliki banyak user |
| users | N : 1 | branches | Satu user terikat ke satu cabang (nullable Owner) |
| users | 1 : 0..1 | doctors | Satu user dokter punya satu profil dokter |
| doctors | M : N | branches | Via tabel pivot `doctor_branch` |
| branches | 1 : N | patients | Cabang asal (home_branch_id) |
| patients | 1 : N | appointments | Satu pasien bisa banyak appointment |
| doctors | 1 : N | appointments | Satu dokter bisa banyak appointment |
| branches | 1 : N | appointments | Satu cabang bisa banyak appointment |
| appointments | 1 : 0..1 | medical_records | Satu appointment menghasilkan max satu rekam medis |
| patients | 1 : N | medical_records | Satu pasien bisa banyak rekam medis |
| doctors | 1 : N | medical_records | Satu dokter bisa banyak rekam medis |
| medical_records | 1 : N | diagnoses | Multi-diagnosa per kunjungan |
| medical_records | 1 : N | treatments | Multi-tindakan per kunjungan |
| medical_records | 1 : N | prescriptions | Multi-obat per kunjungan |
| medical_records | 1 : N | odontograms | Maks. 32 baris per kunjungan |
| medical_records | 1 : N | patient_photos | Multi-foto per kunjungan |
| treatment_masters | 1 : N | treatments | Satu master dirujuk banyak tindakan |
| medical_records | 1 : 0..1 | payments | Satu rekam medis satu pembayaran (tahap awal) |
| payments | 1 : N | payment_details | Satu pembayaran banyak rincian item |
| treatments | 1 : N | payment_details | Satu tindakan bisa ada di banyak detail bayar |
| odontogram_conditions | 1 : N | odontograms | Master kondisi untuk setiap baris odontogram |

---

## 5. Entitas dan Jumlah Kolom Ringkas

| Tabel | Jumlah Kolom (est.) | Tipe Entitas |
|---|---|---|
| `roles` | 4 | Master |
| `users` | 10 | Utama |
| `branches` | 7 | Master |
| `doctors` | 7 | Utama |
| `doctor_branch` | 5 | Pivot |
| `patients` | 17 | Utama |
| `appointments` | 11 | Transaksional |
| `medical_records` | 9 | Transaksional (Agregat) |
| `diagnoses` | 6 | Sub-entitas |
| `treatments` | 8 | Sub-entitas |
| `prescriptions` | 7 | Sub-entitas |
| `odontograms` | 6 | Sub-entitas |
| `patient_photos` | 9 | Sub-entitas |
| `treatment_masters` | 6 | Master |
| `payments` | 17 | Transaksional |
| `payment_details` | 7 | Sub-entitas |
| `odontogram_conditions` | 6 | Master |
| `activity_logs` | 10 | Sistem |
| **Total** | **166** | |

---

*Dokumen ini menjadi dasar untuk `database-schema.md`. Setiap perubahan keputusan arsitektur dari `gap-analysis.md` yang berdampak pada entitas atau relasi harus diupdate di dokumen ini terlebih dahulu sebelum schema SQL di-generate.*
