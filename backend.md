# Backend Development Guide — Widya Santi Dental Care (WSDC)

**Versi Dokumen:** 1.0
**Tanggal:** 15 Juni 2026
**Audience:** Backend Developer, System Architect, Database Engineer
**Status:** Draft untuk review tim teknis

**Tech Stack:**
- **Backend Framework:** Laravel 12
- **Authentication:** Laravel Sanctum
- **Database:** PostgreSQL
- **Storage:** Cloudflare R2 (production) / Local Storage (development)
- **Frontend Consumers:** React + TypeScript (web), Flutter (mobile)

---

## 1. Project Overview

### 1.1 Tujuan Sistem

Backend WSDC dikembangkan sebagai **REST API terpusat** yang melayani kebutuhan operasional klinik gigi Widya Santi Dental Care (WSDC), yang memiliki **3 cabang**. Sistem ini menggantikan proses manual (buku register, Excel, rekam medis kertas, kwitansi manual) dengan satu sumber data digital yang dapat diakses oleh seluruh cabang secara real-time.

Tujuan utama backend:

1. Menyediakan API yang konsisten dan aman untuk dikonsumsi oleh **dua jenis client**: aplikasi web (React + TypeScript) untuk staf klinik (Admin, Dokter, Owner), dan aplikasi mobile (Flutter) — *peruntukan aplikasi mobile perlu dikonfirmasi ke client, apakah untuk dokter, owner, atau pasien (misalnya untuk booking appointment mandiri)*.
2. Mengelola data pasien, rekam medis, appointment, pembayaran, dan laporan dalam satu basis data terpusat (PostgreSQL) dengan dukungan multi-cabang.
3. Menyediakan mekanisme autentikasi dan otorisasi berbasis token (Laravel Sanctum) dengan kontrol akses berbasis role (Admin, Dokter, Owner).
4. Mengelola penyimpanan berkas (foto pasien, foto tindakan, lampiran rekam medis) secara terstruktur menggunakan Cloudflare R2 atau Local Storage.
5. Menyediakan endpoint pelaporan (reporting) yang dapat diolah menjadi visualisasi pada sisi frontend.

### 1.2 Ruang Lingkup Proyek

Ruang lingkup backend mencakup:

- **Manajemen Pengguna & Akses** — autentikasi, role, dan permission untuk Admin, Dokter, dan Owner di seluruh cabang.
- **Master Data** — data cabang, dokter, jenis tindakan & tarif, dan data pendukung lainnya.
- **Manajemen Pasien** — CRUD data pasien, pencarian, dan riwayat kunjungan.
- **Manajemen Appointment** — penjadwalan kunjungan pasien, jadwal praktik dokter.
- **Rekam Medis Digital** — anamnesa, diagnosa, tindakan, resep, odontogram, dan foto pasien.
- **Pembayaran** — transaksi pembayaran (cash, transfer), riwayat, dan kwitansi.
- **Pelaporan** — laporan pendapatan (harian/bulanan/tahunan), laporan per dokter, dan per cabang.
- **File Management** — penyimpanan dan distribusi berkas terkait pasien dan rekam medis.

Di luar ruang lingkup tahap awal (perlu konfirmasi lebih lanjut jika dibutuhkan): integrasi pembayaran online (payment gateway), integrasi WhatsApp API untuk notifikasi otomatis, dan modul apotek/inventori obat.

---

## 2. Business Domain Analysis

Bagian ini menganalisis domain bisnis klinik gigi berdasarkan data yang telah diidentifikasi, sebagai dasar perancangan struktur database dan API.

### 2.1 Domain Pasien (Patient)

Entitas pasien merupakan entitas inti yang menjadi rujukan seluruh transaksi klinik (appointment, rekam medis, pembayaran). Atribut yang teridentifikasi:

| Atribut | Analisis Domain |
|---|---|
| Nomor Rekam Medis | Identifier unik pasien dalam sistem, idealnya **digenerate otomatis** dan bersifat permanen seumur hidup pasien, tidak berubah meski pasien berpindah cabang (karena data bersifat terpusat). |
| Nama | Atribut deskriptif, dapat berubah (misalnya pernikahan), namun untuk rekam medis sebaiknya dicatat snapshot nama pada saat transaksi jika diperlukan audit — *untuk tahap awal cukup referensi langsung ke data pasien terkini*. |
| NIK | Berpotensi menjadi **unique identifier sekunder**, namun perlu nullable karena tidak semua pasien (anak-anak, WNA) memiliki NIK. |
| TTL (Tempat & Tanggal Lahir) | Tanggal lahir digunakan untuk kalkulasi usia secara dinamis — sebaiknya disimpan sebagai tanggal, bukan angka usia statis. |
| Alamat | Atribut deskriptif, disimpan sebagai teks bebas pada tahap awal — *dapat dipertimbangkan struktur wilayah (provinsi/kota/kecamatan) pada tahap lanjutan jika dibutuhkan untuk analisis demografi*. |
| Nomor HP | Berfungsi ganda sebagai kontak dan kunci pencarian pasien — sebaiknya divalidasi format dan dapat diberi index untuk pencarian cepat. |
| Pekerjaan | Atribut deskriptif opsional. |

**Keputusan domain:** Pasien adalah entitas **global** (satu database untuk 3 cabang), namun setiap pasien memiliki relasi ke cabang tempat ia **pertama kali terdaftar** (cabang asal), sambil tetap dapat melakukan kunjungan ke cabang manapun. Ini memungkinkan riwayat rekam medis pasien tetap terhubung lintas cabang sesuai kebutuhan bisnis yang dijelaskan pada frontend.md.

### 2.2 Domain Rekam Medis (Medical Record)

Rekam medis adalah entitas yang merepresentasikan **satu kunjungan pemeriksaan** pasien, dan memiliki relasi satu-ke-banyak dengan beberapa sub-entitas:

| Sub-entitas | Analisis Domain |
|---|---|
| Anamnesa | Bersifat **naratif** (free text), unik per kunjungan, tidak memiliki struktur tabular — disimpan sebagai kolom teks pada tabel rekam medis. |
| Diagnosa | Bersifat **multi** (satu kunjungan dapat memiliki lebih dari satu diagnosa) — direpresentasikan sebagai tabel anak (`diagnoses`) dengan relasi ke `medical_records`. |
| Tindakan | Bersifat **multi** dan memiliki **nilai moneter** (tarif) yang menjadi dasar pembayaran — direpresentasikan sebagai tabel anak (`treatments`) yang terhubung ke master tindakan untuk konsistensi tarif. |
| Resep | Bersifat **multi** (lebih dari satu obat per kunjungan) — direpresentasikan sebagai tabel anak (`prescriptions`). |
| Odontogram | Merepresentasikan kondisi seluruh gigi pasien (notasi gigi + kondisi tiap gigi). Bersifat **historis per kunjungan** sesuai kebutuhan klinis (melihat perkembangan kondisi gigi dari waktu ke waktu) — direpresentasikan sebagai tabel anak (`odontograms`) dengan relasi ke `medical_records`, di mana setiap baris merepresentasikan satu gigi dengan kondisinya. |
| Foto | Bersifat **multi** dan berupa file binary — disimpan sebagai metadata pada tabel `patient_photos` dengan path/URL menuju file storage. |

**Keputusan domain:** Rekam medis dirancang sebagai **agregat** dengan satu tabel induk (`medical_records`) dan beberapa tabel anak yang merepresentasikan diagnosa, tindakan, resep, odontogram, dan foto — masing-masing dengan relasi `one-to-many` terhadap `medical_records`. Pendekatan ini memberikan fleksibilitas multi-item per kunjungan dan kemudahan query historis per pasien.

### 2.3 Domain Pembayaran (Payment)

Pembayaran terkait langsung dengan rekam medis (tindakan yang dilakukan menjadi dasar perhitungan biaya). Dua metode pembayaran teridentifikasi: **Cash** dan **Transfer**.

| Aspek | Analisis Domain |
|---|---|
| Relasi dengan Tindakan | Satu transaksi pembayaran dapat mencakup **lebih dari satu tindakan** dari satu kunjungan (rekam medis) — direpresentasikan dengan tabel `payments` (header transaksi) dan `payment_details` (rincian per tindakan/item). |
| Metode Pembayaran | Disimpan sebagai enum (`cash`, `transfer`) pada tabel `payments` — *perlu dikonfirmasi apakah metode lain seperti kartu debit/kredit atau QRIS akan ditambahkan pada tahap lanjutan; struktur enum dirancang agar mudah diperluas*. |
| Status Pembayaran | Diperlukan status seperti `pending`, `paid`, `partial` (jika ada cicilan), `cancelled` — *fitur cicilan perlu dikonfirmasi ke client; pada tahap awal status minimal `paid`*. |
| Kwitansi | Bukan entitas tersendiri, melainkan **representasi cetak/PDF** dari data `payments` + `payment_details` + data pasien — dihasilkan melalui endpoint khusus, tidak disimpan sebagai entitas permanen kecuali dibutuhkan arsip PDF. |

### 2.4 Domain Multi-Cabang (Branch)

Seluruh entitas transaksional (appointment, medical_records, payments) memiliki relasi ke entitas `branches` untuk mendukung:

- Pelaporan terpisah per cabang (pendapatan per cabang, jumlah pasien per cabang).
- Pembatasan akses pengguna (Admin dan Dokter terikat ke cabang tertentu — *sesuai konfirmasi pada frontend.md*).
- Penjadwalan dokter yang dapat bertugas di lebih dari satu cabang (relasi many-to-many antara `doctors` dan `branches`).

**Keputusan domain:** Entitas `patients` bersifat global (tidak terikat satu cabang secara eksklusif, namun memiliki `home_branch_id` sebagai cabang pendaftaran awal), sedangkan entitas `users` (Admin/Dokter) memiliki relasi ke cabang sesuai penugasan.

---

## 3. System Architecture

### 3.1 Diagram Arsitektur Tingkat Tinggi

```
┌─────────────────────┐        ┌─────────────────────┐
│   React + TypeScript │        │    Flutter Mobile    │
│   (Web - Admin,      │        │   (Dokter/Owner -    │
│   Dokter, Owner)     │        │   perlu konfirmasi)  │
└──────────┬───────────┘        └───────────┬──────────┘
           │                                  │
           │   HTTPS (JSON / REST API)        │
           │   Authorization: Bearer <token>  │
           └────────────────┬─────────────────┘
                             │
                  ┌──────────▼───────────┐
                  │   Laravel 12 API      │
                  │   (Sanctum Auth)      │
                  │                       │
                  │  - Controllers        │
                  │  - Form Requests      │
                  │  - Services           │
                  │  - Policies/Gates     │
                  │  - Resources (JSON)   │
                  └──────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                      │                      │
┌───────▼────────┐   ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   PostgreSQL    │   │  Cloudflare R2     │  │   Local Storage    │
│   (Primary DB)  │   │  (Production File  │  │  (Development /    │
│                 │   │   Storage)         │  │   Fallback)        │
└─────────────────┘   └────────────────────┘  └─────────────────────┘
```

### 3.2 Penjelasan Komunikasi Antar Sistem

**React (Web) ↔ Laravel API**
- Komunikasi menggunakan REST API berbasis JSON melalui HTTPS.
- Autentikasi menggunakan Laravel Sanctum dengan **Bearer Token** (Personal Access Token), bukan SPA cookie-based session — karena frontend React dapat di-deploy pada domain berbeda dari backend (perlu dikonfirmasi topologi domain/subdomain final).
- Setiap request setelah login menyertakan header `Authorization: Bearer <token>`.
- Response menggunakan format JSON terstandarisasi (lihat Bagian 7) melalui Laravel API Resources.

**Flutter (Mobile) ↔ Laravel API**
- Komunikasi menggunakan REST API yang **sama persis** dengan yang digunakan React — tidak ada endpoint terpisah untuk mobile, kecuali ada kebutuhan spesifik di masa depan (misalnya endpoint ringan untuk performa mobile).
- Autentikasi menggunakan Sanctum Bearer Token, token disimpan secara aman pada secure storage perangkat (Keychain/Keystore).
- *Peruntukan aplikasi Flutter (untuk staf internal atau pasien) perlu dikonfirmasi ke client karena akan mempengaruhi desain endpoint (misalnya jika untuk pasien, dibutuhkan role/guard tambahan "patient")*.

**Laravel API ↔ PostgreSQL**
- Laravel berkomunikasi dengan PostgreSQL melalui Eloquent ORM dan query builder.
- Seluruh transaksi yang melibatkan lebih dari satu tabel (misalnya menyimpan rekam medis beserta tindakan, resep, dan odontogram sekaligus) dibungkus dalam **database transaction** untuk menjaga konsistensi data.
- Koneksi database menggunakan environment-based configuration (`.env`), terpisah untuk environment development, staging, dan production.

**Laravel API ↔ File Storage (Cloudflare R2 / Local Storage)**
- Laravel menggunakan **Filesystem abstraction** (`Storage` facade) dengan disk yang dapat dikonfigurasi melalui `.env` — disk `r2` untuk production dan disk `local`/`public` untuk development.
- File yang diunggah (foto pasien, foto tindakan, lampiran) diproses melalui endpoint upload khusus, divalidasi (tipe file, ukuran maksimum), kemudian disimpan ke disk aktif. Path/URL hasil penyimpanan disimpan sebagai metadata di PostgreSQL (tabel `patient_photos`).
- Untuk Cloudflare R2, akses file dapat menggunakan signed URL (jika bucket private) atau public URL (jika bucket public) — *kebijakan privasi foto pasien perlu dikonfirmasi, mengingat foto medis bersifat sensitif; disarankan menggunakan signed URL dengan masa berlaku terbatas*.

### 3.3 Pertimbangan Arsitektur Tambahan

- **Stateless API**: Laravel API dirancang stateless (tidak menggunakan session berbasis cookie untuk autentikasi API), sehingga dapat di-scale secara horizontal jika dibutuhkan.
- **Single Source of Truth**: PostgreSQL sebagai satu-satunya basis data utama untuk seluruh cabang — tidak ada database terpisah per cabang.
- **Environment Separation**: disarankan minimal 2 environment (staging dan production) dengan konfigurasi storage dan database terpisah.
- **API Versioning**: seluruh endpoint API menggunakan prefix versi (misalnya `/api/v1/...`) untuk memudahkan perubahan struktur API di masa depan tanpa memutus kompatibilitas client yang sudah berjalan.

---

## 4. User Roles & Permissions

Role sistem mengikuti definisi pada `frontend.md` Bagian 3: **Admin**, **Dokter**, dan **Owner**. Bagian ini menjelaskan implementasi permission pada sisi backend menggunakan kombinasi **role-based** (kolom `role` pada tabel `users` atau tabel `roles` terpisah) dan **Laravel Policies/Gates** untuk otorisasi granular per endpoint.

### 4.1 Admin

**Permission Backend:**

| Resource | Create | Read | Update | Delete |
|---|---|---|---|---|
| Patients | ✅ | ✅ | ✅ | ❌ (soft delete dengan approval — *perlu dikonfirmasi*) |
| Appointments | ✅ | ✅ | ✅ | ✅ (untuk cabangnya) |
| Medical Records | ❌ | ✅ (read-only, ringkasan tindakan untuk billing — *perlu dikonfirmasi cakupan detail*) | ❌ | ❌ |
| Payments | ✅ | ✅ | ✅ (sebelum status final) | ❌ |
| Reports | ❌ atau ✅ terbatas pada cabangnya (*perlu dikonfirmasi*) | — | — | — |
| Master Data | ❌ (read-only untuk referensi, kecuali ditentukan lain) | ✅ | ❌ | ❌ |

**Batasan tambahan:**
- Admin hanya dapat mengakses data (pasien, appointment, pembayaran) yang relevan dengan **cabang tempat ia bertugas** — diimplementasikan melalui scope/middleware yang memfilter query berdasarkan `branch_id` pada token/user.
- *Perlu dikonfirmasi: apakah Admin dapat melihat data pasien dari cabang lain saat pasien tersebut datang ke cabangnya (skenario pasien lintas cabang)?* — jika ya, maka pencarian pasien bersifat global, namun pencatatan kunjungan baru tetap tercatat di cabang Admin yang aktif.

### 4.2 Dokter

**Permission Backend:**

| Resource | Create | Read | Update | Delete |
|---|---|---|---|---|
| Patients | ❌ | ✅ (read-only) | ❌ | ❌ |
| Appointments | ❌ | ✅ (hanya jadwal miliknya) | ❌ atau ✅ terbatas (update status kunjungan) | ❌ |
| Medical Records | ✅ | ✅ (pasien yang ditanganinya) | ✅ (*perlu dikonfirmasi: hanya rekam medis miliknya sendiri yang sedang dibuat pada hari yang sama, atau termasuk edit data lampau*) | ❌ |
| Diagnoses/Treatments/Prescriptions/Odontogram/Photos | ✅ (sub-resource dari Medical Records) | ✅ | ✅ (sesuai batasan di atas) | ❌ |
| Payments | ❌ | ❌ | ❌ | ❌ |
| Reports | ❌ (atau read-only laporan ringkas personal — opsional) | — | — | — |
| Master Data | ❌ (read-only untuk daftar tindakan/tarif sebagai referensi saat input rekam medis) | ✅ | ❌ | ❌ |

**Batasan tambahan:**
- Dokter hanya dapat mengakses dan membuat rekam medis untuk pasien yang **terdaftar pada appointment/kunjungan miliknya** pada cabang tempat ia bertugas.
- Jika seorang dokter bertugas di lebih dari satu cabang (relasi many-to-many `doctors` ↔ `branches`), maka akses data disesuaikan dengan cabang yang sedang aktif pada sesi/permintaan tersebut (*mekanisme pemilihan cabang aktif perlu dikonfirmasi — apakah dipilih saat login atau otomatis berdasarkan jadwal hari tersebut*).

### 4.3 Owner

**Permission Backend:**

| Resource | Create | Read | Update | Delete |
|---|---|---|---|---|
| Patients | ❌ | ✅ (seluruh cabang) | ❌ | ❌ |
| Appointments | ❌ | ✅ (seluruh cabang) | ❌ | ❌ |
| Medical Records | ❌ | ✅ (seluruh cabang, untuk audit — *perlu dikonfirmasi kedalaman akses*) | ❌ | ❌ |
| Payments | ❌ | ✅ (seluruh cabang) | ❌ | ❌ |
| Reports | — | ✅ (seluruh cabang, dengan filter per cabang/dokter/periode) | — | — |
| Master Data | ✅ | ✅ | ✅ | ✅ (atau didelegasikan ke "Super Admin" — *perlu dikonfirmasi*) |

**Batasan tambahan:**
- Owner memiliki akses **lintas cabang** secara default, dengan kemampuan filter data berdasarkan cabang tertentu pada endpoint laporan dan listing data.
- Pengelolaan Master Data (cabang, dokter, tindakan & tarif, manajemen pengguna) berada di bawah Owner kecuali disepakati adanya role tambahan "Super Admin" (lihat Bagian 12, Open Questions terkait role).

### 4.4 Implementasi Teknis Permission

- **Struktur Role**: disarankan menggunakan tabel `roles` terpisah (bukan enum statis pada kolom `users.role`) untuk fleksibilitas penambahan role di masa depan (misalnya Resepsionis, Perawat) tanpa migrasi besar — relasi `users.role_id` → `roles.id`.
- **Middleware**: setiap route API dilindungi middleware `auth:sanctum` untuk autentikasi, dan middleware kustom (misalnya `role:admin`, `role:doctor,owner`) untuk otorisasi berbasis role pada level route group.
- **Policy/Gate**: untuk otorisasi yang lebih granular (misalnya "Dokter hanya dapat mengedit rekam medis miliknya sendiri"), digunakan Laravel Policy per model (`MedicalRecordPolicy`, `PaymentPolicy`, dll.) yang dipanggil di dalam controller atau melalui `authorize()`.
- **Branch Scoping**: digunakan **Global Scope** pada model Eloquent (misalnya `BranchScope`) yang secara otomatis memfilter query berdasarkan `branch_id` milik pengguna yang sedang login, kecuali untuk role Owner yang di-bypass dari scope ini.

---

## 5. Database Design

Seluruh tabel menggunakan PostgreSQL dengan primary key `id` (bigint, auto-increment atau UUID — *disarankan UUID untuk tabel yang berpotensi diakses lintas sistem seperti `patients`, namun bigint auto-increment cukup untuk tahap awal; keputusan final perlu disepakati tim arsitektur*). Seluruh tabel menggunakan kolom standar `created_at`, `updated_at`, dan `deleted_at` (soft delete) kecuali dinyatakan lain.

### 5.1 Tabel `users`

**Tujuan:** Menyimpan akun pengguna sistem (Admin, Dokter, Owner) untuk keperluan autentikasi dan otorisasi.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier unik pengguna. |
| name | varchar | Nama pengguna. |
| email | varchar, unique | Digunakan untuk login. |
| password | varchar | Password terenkripsi (hash). |
| role_id | bigint, FK → roles.id | Role pengguna (Admin/Dokter/Owner). |
| branch_id | bigint, FK → branches.id, nullable | Cabang penugasan utama. Nullable untuk Owner (akses seluruh cabang). |
| is_active | boolean, default true | Status aktif akun, untuk menonaktifkan akun tanpa menghapus. |
| email_verified_at | timestamp, nullable | Standar Laravel. |
| remember_token | varchar, nullable | Standar Laravel. |

**Relasi:**
- `belongsTo Role` (role_id).
- `belongsTo Branch` (branch_id) — nullable.
- `hasOne Doctor` (jika role = dokter; relasi opsional ke profil dokter).
- `hasMany PersonalAccessToken` (relasi standar Sanctum).

### 5.2 Tabel `roles`

**Tujuan:** Menyimpan daftar role sistem secara dinamis (Admin, Dokter, Owner, dan kemungkinan role tambahan di masa depan).

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier role. |
| name | varchar, unique | Nama role (misalnya `admin`, `doctor`, `owner`). |
| display_name | varchar | Nama tampilan (misalnya "Administrator", "Dokter", "Owner"). |
| description | text, nullable | Deskripsi singkat role. |

**Relasi:**
- `hasMany User`.

### 5.3 Tabel `branches`

**Tujuan:** Menyimpan data master 3 cabang WSDC.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier cabang. |
| name | varchar | Nama cabang (misalnya "WSDC Cabang A"). |
| code | varchar, unique | Kode singkat cabang, digunakan untuk format nomor rekam medis/kwitansi (misalnya "WSDC-A"). |
| address | text | Alamat cabang. |
| phone | varchar, nullable | Nomor telepon cabang. |
| is_active | boolean, default true | Status operasional cabang. |

**Relasi:**
- `hasMany User`.
- `hasMany Patient` (sebagai `home_branch_id`).
- `hasMany Appointment`.
- `hasMany MedicalRecord`.
- `hasMany Payment`.
- `belongsToMany Doctor` (melalui tabel pivot `doctor_branch`).

### 5.4 Tabel `doctors`

**Tujuan:** Menyimpan profil dokter, terpisah dari `users` agar dapat menyimpan atribut spesifik dokter (spesialisasi, nomor SIP, dll.) tanpa mencampur dengan data akun.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier dokter. |
| user_id | bigint, FK → users.id, unique | Relasi ke akun pengguna untuk login. |
| name | varchar | Nama dokter (dapat duplikasi dari users.name untuk tampilan rekam medis/kwitansi, atau referensi langsung — *perlu disepakati*). |
| sip_number | varchar, nullable | Nomor Surat Izin Praktik. |
| specialization | varchar, nullable | Spesialisasi (misalnya "Dokter Gigi Umum", "Ortodonti"). |
| signature_image_path | varchar, nullable | Path gambar tanda tangan digital dokter, untuk pencetakan resep/rekam medis (opsional, *perlu dikonfirmasi*). |

**Relasi:**
- `belongsTo User`.
- `belongsToMany Branch` (melalui tabel pivot `doctor_branch`) — mendukung dokter yang bertugas di lebih dari satu cabang.
- `hasMany Appointment`.
- `hasMany MedicalRecord`.

### 5.5 Tabel Pivot `doctor_branch`

**Tujuan:** Merepresentasikan relasi many-to-many antara dokter dan cabang tempat mereka bertugas, termasuk jadwal praktik per cabang.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier baris pivot. |
| doctor_id | bigint, FK → doctors.id | Dokter terkait. |
| branch_id | bigint, FK → branches.id | Cabang terkait. |
| schedule | jsonb, nullable | Jadwal praktik dalam format JSON (misalnya hari dan jam praktik per cabang) — *struktur detail perlu disepakati pada tahap Modul Appointment*. |

### 5.6 Tabel `patients`

**Tujuan:** Menyimpan data identitas pasien sesuai struktur data pada `frontend.md` Bagian 5, sebagai entitas global lintas cabang.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier internal pasien. |
| medical_record_number | varchar, unique | Nomor rekam medis, digenerate otomatis (format perlu disepakati, misalnya `{kode_cabang}-{tahun}-{nomor_urut}`). |
| name | varchar | Nama lengkap pasien. |
| nik | varchar(16), nullable, unique (jika tidak null) | Nomor Induk Kependudukan. |
| birth_place | varchar | Tempat lahir. |
| birth_date | date | Tanggal lahir. |
| gender | enum(`male`,`female`) | Jenis kelamin. |
| address | text | Alamat domisili. |
| phone_number | varchar, indexed | Nomor HP, diberi index untuk pencarian cepat. |
| occupation | varchar, nullable | Pekerjaan. |
| home_branch_id | bigint, FK → branches.id | Cabang tempat pasien pertama kali terdaftar. |

**Relasi:**
- `belongsTo Branch` (home_branch_id).
- `hasMany Appointment`.
- `hasMany MedicalRecord`.
- `hasMany Payment` (melalui medical_records, atau langsung jika diperlukan agregasi cepat).
- `hasMany PatientPhoto`.

**Catatan:** Pertimbangkan index gabungan pada `name` dan `phone_number` untuk mendukung fitur pencarian pasien sesuai kebutuhan frontend (full-text search dapat dipertimbangkan menggunakan ekstensi PostgreSQL `pg_trgm` jika volume data besar).

### 5.7 Tabel `appointments`

**Tujuan:** Menyimpan data penjadwalan kunjungan pasien (booking) dan status kunjungan harian.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier appointment. |
| patient_id | bigint, FK → patients.id | Pasien yang dijadwalkan. |
| doctor_id | bigint, FK → doctors.id | Dokter yang dituju. |
| branch_id | bigint, FK → branches.id | Cabang tujuan kunjungan. |
| appointment_date | date | Tanggal kunjungan. |
| appointment_time | time, nullable | Jam kunjungan (nullable untuk walk-in tanpa jadwal spesifik). |
| status | enum(`scheduled`,`checked_in`,`in_progress`,`completed`,`cancelled`,`no_show`) | Status kunjungan, digunakan untuk Daftar Kunjungan Hari Ini pada frontend. |
| notes | text, nullable | Catatan tambahan saat booking (misalnya keluhan awal yang disampaikan via WhatsApp). |
| created_by | bigint, FK → users.id | Pengguna (Admin) yang membuat appointment. |

**Relasi:**
- `belongsTo Patient`.
- `belongsTo Doctor`.
- `belongsTo Branch`.
- `hasOne MedicalRecord` (rekam medis yang dihasilkan dari kunjungan ini — *relasi one-to-one per kunjungan, perlu dikonfirmasi apakah satu appointment selalu menghasilkan tepat satu rekam medis*).

### 5.8 Tabel `medical_records`

**Tujuan:** Tabel induk (agregat) yang merepresentasikan satu kunjungan pemeriksaan pasien, menjadi parent dari diagnoses, treatments, prescriptions, odontograms, dan patient_photos.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier rekam medis. |
| patient_id | bigint, FK → patients.id | Pasien terkait. |
| doctor_id | bigint, FK → doctors.id | Dokter yang memeriksa. |
| branch_id | bigint, FK → branches.id | Cabang tempat pemeriksaan dilakukan. |
| appointment_id | bigint, FK → appointments.id, nullable | Relasi ke appointment asal (nullable untuk walk-in tanpa booking sebelumnya). |
| visit_date | date | Tanggal kunjungan/pemeriksaan. |
| anamnesis | text | Catatan anamnesa (keluhan, riwayat — sesuai frontend.md Bagian 6.1). |
| additional_notes | text, nullable | Catatan tambahan dokter di luar struktur anamnesa/diagnosa formal. |

**Relasi:**
- `belongsTo Patient`.
- `belongsTo Doctor`.
- `belongsTo Branch`.
- `belongsTo Appointment` (nullable).
- `hasMany Diagnosis`.
- `hasMany Treatment`.
- `hasMany Prescription`.
- `hasMany Odontogram`.
- `hasMany PatientPhoto`.
- `hasOne Payment` (atau `hasMany` jika satu rekam medis dapat dibayar dalam lebih dari satu transaksi/cicilan — *perlu dikonfirmasi*).

### 5.9 Tabel `diagnoses`

**Tujuan:** Menyimpan satu atau lebih diagnosa per rekam medis (mendukung multi-diagnosa sesuai analisis domain Bagian 2.2).

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier diagnosa. |
| medical_record_id | bigint, FK → medical_records.id | Rekam medis terkait. |
| diagnosis_code | varchar, nullable | Kode diagnosa standar (misalnya ICD-10), jika digunakan — *perlu dikonfirmasi*. |
| diagnosis_name | varchar | Nama/deskripsi diagnosa. |
| tooth_number | varchar, nullable | Nomor gigi terkait (notasi sesuai odontogram), nullable untuk diagnosa umum yang tidak spesifik pada satu gigi. |
| notes | text, nullable | Catatan tambahan. |

**Relasi:**
- `belongsTo MedicalRecord`.

### 5.10 Tabel `treatments`

**Tujuan:** Menyimpan satu atau lebih tindakan medis yang dilakukan pada satu kunjungan, termasuk referensi ke tarif master (untuk keperluan pembayaran).

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier tindakan dalam rekam medis. |
| medical_record_id | bigint, FK → medical_records.id | Rekam medis terkait. |
| treatment_master_id | bigint, FK → treatment_masters.id, nullable | Referensi ke master tindakan & tarif. Nullable jika tindakan bersifat custom/tidak baku. |
| tooth_number | varchar, nullable | Nomor gigi yang ditangani. |
| name | varchar | Nama tindakan (dicatat sebagai snapshot dari master, agar histori tidak berubah jika master diperbarui). |
| price | decimal(12,2) | Tarif tindakan (snapshot dari master pada saat transaksi). |
| notes | text, nullable | Catatan tindakan/instruksi pasca-tindakan. |

**Relasi:**
- `belongsTo MedicalRecord`.
- `belongsTo TreatmentMaster` (nullable).
- `hasMany PaymentDetail` (sebagai item yang dapat dibayar).

**Catatan penting:** Kolom `name` dan `price` disimpan sebagai **snapshot** (denormalized) dari `treatment_masters` pada saat input, agar perubahan tarif master di kemudian hari tidak mengubah data historis rekam medis dan pembayaran yang sudah terjadi.

### 5.11 Tabel `prescriptions`

**Tujuan:** Menyimpan satu atau lebih resep obat per rekam medis.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier resep. |
| medical_record_id | bigint, FK → medical_records.id | Rekam medis terkait. |
| medicine_name | varchar | Nama obat. |
| dosage | varchar | Dosis (misalnya "500mg"). |
| frequency | varchar | Frekuensi penggunaan (misalnya "3x1 sehari"). |
| quantity | integer | Jumlah obat yang diberikan. |
| notes | text, nullable | Catatan tambahan (misalnya "diminum setelah makan"). |

**Relasi:**
- `belongsTo MedicalRecord`.

### 5.12 Tabel `odontograms`

**Tujuan:** Menyimpan kondisi tiap gigi pasien pada satu kunjungan (rekam medis), mendukung representasi visual odontogram pada frontend.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier baris odontogram. |
| medical_record_id | bigint, FK → medical_records.id | Rekam medis terkait. |
| tooth_number | varchar | Nomor gigi (notasi FDI/Universal — *perlu disepakati dengan dokter sesuai frontend.md Bagian 6.6*). |
| condition_code | varchar | Kode kondisi gigi (misalnya `healthy`, `caries`, `filled`, `missing`, `extraction_needed`, `root_canal` — *daftar lengkap perlu disusun bersama dokter*). |
| notes | text, nullable | Catatan tambahan per gigi. |

**Relasi:**
- `belongsTo MedicalRecord`.

**Catatan:** Setiap kunjungan dapat menghasilkan hingga 32 baris (satu per gigi dewasa) atau lebih sedikit jika hanya gigi tertentu yang dicatat — *perlu dikonfirmasi apakah seluruh gigi dicatat setiap kunjungan (snapshot lengkap) atau hanya gigi yang mengalami perubahan kondisi*.

### 5.13 Tabel `payments`

**Tujuan:** Menyimpan header transaksi pembayaran, satu baris per transaksi (dapat mencakup beberapa tindakan/item melalui `payment_details`).

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier transaksi pembayaran. |
| invoice_number | varchar, unique | Nomor kwitansi, digenerate otomatis (format perlu disepakati, misalnya `{kode_cabang}-{tahun}{bulan}-{nomor_urut}`). |
| medical_record_id | bigint, FK → medical_records.id | Rekam medis yang menjadi dasar pembayaran. |
| patient_id | bigint, FK → patients.id | Pasien terkait (denormalized untuk kemudahan query laporan). |
| branch_id | bigint, FK → branches.id | Cabang transaksi (denormalized untuk laporan per cabang). |
| doctor_id | bigint, FK → doctors.id | Dokter terkait (denormalized untuk laporan per dokter). |
| payment_method | enum(`cash`,`transfer`) | Metode pembayaran. |
| total_amount | decimal(12,2) | Total nominal sebelum diskon. |
| discount_amount | decimal(12,2), default 0 | Nominal diskon (jika ada — *perlu dikonfirmasi mekanisme diskon*). |
| final_amount | decimal(12,2) | Total setelah diskon (yang harus dibayar). |
| paid_amount | decimal(12,2) | Jumlah yang dibayarkan (untuk kalkulasi kembalian jika cash). |
| status | enum(`pending`,`paid`,`partial`,`cancelled`) | Status pembayaran. |
| paid_at | timestamp, nullable | Waktu pembayaran selesai. |
| created_by | bigint, FK → users.id | Admin yang memproses pembayaran. |

**Relasi:**
- `belongsTo MedicalRecord`.
- `belongsTo Patient`.
- `belongsTo Branch`.
- `belongsTo Doctor`.
- `belongsTo User` (created_by).
- `hasMany PaymentDetail`.

**Catatan untuk Database Engineer:** Kolom `patient_id`, `branch_id`, dan `doctor_id` bersifat **denormalized** (dapat diturunkan dari `medical_record_id`) namun disertakan langsung untuk **mengoptimalkan query laporan** (Bagian 10) agar tidak memerlukan join berlapis pada setiap pembuatan laporan.

### 5.14 Tabel `payment_details`

**Tujuan:** Menyimpan rincian item yang dibayar dalam satu transaksi pembayaran, merujuk ke tindakan (`treatments`) yang dilakukan.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier rincian pembayaran. |
| payment_id | bigint, FK → payments.id | Transaksi pembayaran terkait. |
| treatment_id | bigint, FK → treatments.id | Tindakan yang dibayar. |
| description | varchar | Deskripsi item (snapshot nama tindakan). |
| price | decimal(12,2) | Harga item (snapshot). |
| quantity | integer, default 1 | Jumlah (umumnya 1 untuk tindakan, namun disediakan untuk fleksibilitas). |
| subtotal | decimal(12,2) | `price * quantity`. |

**Relasi:**
- `belongsTo Payment`.
- `belongsTo Treatment`.

### 5.15 Tabel `patient_photos`

**Tujuan:** Menyimpan metadata foto pasien (kondisi gigi/mulut, hasil rontgen, dll.) yang terkait dengan satu rekam medis.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier foto. |
| medical_record_id | bigint, FK → medical_records.id | Rekam medis terkait. |
| patient_id | bigint, FK → patients.id | Pasien terkait (denormalized untuk query riwayat foto pasien tanpa join ke medical_records). |
| file_path | varchar | Path/key file pada storage (R2/local). |
| file_url | varchar, nullable | URL akses (jika public) atau null jika menggunakan signed URL yang digenerate on-demand. |
| file_type | varchar | Tipe foto (misalnya `clinical_photo`, `xray`, `before`, `after` — *kategori final perlu disepakati*). |
| caption | varchar, nullable | Keterangan singkat foto. |
| uploaded_by | bigint, FK → users.id | Pengguna yang mengunggah. |

**Relasi:**
- `belongsTo MedicalRecord`.
- `belongsTo Patient`.
- `belongsTo User` (uploaded_by).

### 5.16 Tabel `treatment_masters` (Master Data)

**Tujuan:** Menyimpan daftar referensi jenis tindakan dan tarifnya, digunakan saat input tindakan pada rekam medis dan sebagai sumber kalkulasi pembayaran.

**Field Utama:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | Identifier master tindakan. |
| name | varchar | Nama tindakan (misalnya "Tambal Gigi Komposit"). |
| default_price | decimal(12,2) | Tarif standar. |
| branch_id | bigint, FK → branches.id, nullable | Jika tarif berbeda per cabang, kolom ini diisi; jika tarif sama di seluruh cabang, kolom ini null dan tarif bersifat global — *perlu dikonfirmasi sesuai Open Questions frontend.md poin 18*. |
| is_active | boolean, default true | Status aktif tindakan dalam daftar master. |

**Relasi:**
- `belongsTo Branch` (nullable).
- `hasMany Treatment`.

### 5.17 Catatan Tambahan Database Design

- Seluruh tabel transaksi (`appointments`, `medical_records`, `payments`) sebaiknya memiliki index pada kolom `branch_id`, `patient_id`, dan kolom tanggal (`appointment_date`, `visit_date`, `paid_at`) untuk mendukung performa query laporan dan filter.
- Soft delete (`deleted_at`) diterapkan pada tabel-tabel utama (`patients`, `medical_records`, `payments`, `appointments`) untuk menjaga jejak audit, mengingat data medis dan keuangan tidak boleh hilang permanen tanpa jejak.
- Seluruh tabel `*_masters` (misalnya `treatment_masters`) menggunakan pola snapshot pada tabel transaksi terkait (lihat catatan Bagian 5.10) untuk menjaga integritas data historis.

---

## 6. Entity Relationship Design

Bagian ini menjelaskan hubungan antar tabel secara naratif sebagai panduan bagi Database Engineer dalam menyusun ERD visual dan migrasi.

### 6.1 Relasi Inti

- **`roles` → `users`**: Satu role dapat dimiliki oleh banyak pengguna (`one-to-many`). Setiap `user` memiliki tepat satu `role`.
- **`branches` → `users`**: Satu cabang dapat memiliki banyak pengguna (Admin/Dokter yang ditugaskan) (`one-to-many`). Kolom `branch_id` pada `users` bersifat nullable untuk role Owner.
- **`users` → `doctors`**: Relasi `one-to-one`. Setiap akun dengan role Dokter memiliki satu profil `doctor` yang menyimpan atribut tambahan (SIP, spesialisasi).
- **`doctors` ↔ `branches`**: Relasi `many-to-many` melalui tabel pivot `doctor_branch`, merepresentasikan dokter yang dapat bertugas di lebih dari satu cabang dengan jadwal masing-masing.

### 6.2 Relasi Pasien dan Transaksi

- **`branches` → `patients`**: Relasi `one-to-many` melalui `home_branch_id`, merepresentasikan cabang pendaftaran awal pasien. Pasien bersifat global dan dapat melakukan kunjungan di cabang manapun melalui `appointments` dan `medical_records`.
- **`patients` → `appointments`**: Relasi `one-to-many`. Satu pasien dapat memiliki banyak appointment di berbagai cabang dan dokter.
- **`doctors` → `appointments`**: Relasi `one-to-many`. Satu dokter dapat memiliki banyak appointment.
- **`branches` → `appointments`**: Relasi `one-to-many`. Setiap appointment terikat pada satu cabang.
- **`appointments` → `medical_records`**: Relasi `one-to-one` (opsional/nullable). Satu appointment yang telah selesai dapat menghasilkan satu rekam medis. Rekam medis juga dapat dibuat tanpa appointment (walk-in tanpa booking sebelumnya), sehingga `appointment_id` pada `medical_records` bersifat nullable.

### 6.3 Relasi Agregat Rekam Medis

- **`medical_records` → `diagnoses`**: `one-to-many`. Satu rekam medis dapat memiliki banyak diagnosa.
- **`medical_records` → `treatments`**: `one-to-many`. Satu rekam medis dapat memiliki banyak tindakan.
- **`treatment_masters` → `treatments`**: `one-to-many` (nullable reference). Setiap tindakan dapat merujuk ke satu master tindakan sebagai acuan tarif standar, namun data tindakan menyimpan snapshot sendiri.
- **`medical_records` → `prescriptions`**: `one-to-many`. Satu rekam medis dapat memiliki banyak resep obat.
- **`medical_records` → `odontograms`**: `one-to-many`. Satu rekam medis dapat memiliki banyak baris odontogram (maksimal 32 baris, satu per gigi dewasa).
- **`medical_records` → `patient_photos`**: `one-to-many`. Satu rekam medis dapat memiliki banyak foto.
- **`patients` → `patient_photos`**: `one-to-many` (denormalized). Memudahkan pengambilan seluruh foto pasien tanpa join ke `medical_records` untuk setiap kunjungan.

### 6.4 Relasi Pembayaran

- **`medical_records` → `payments`**: `one-to-one` atau `one-to-many` (*perlu dikonfirmasi jika fitur cicilan diaktifkan, maka relasinya menjadi one-to-many*). Pada tahap awal diasumsikan `one-to-one`: satu rekam medis menghasilkan satu transaksi pembayaran.
- **`payments` → `payment_details`**: `one-to-many`. Satu transaksi pembayaran dapat mencakup rincian beberapa item (tindakan).
- **`treatments` → `payment_details`**: `one-to-many` (umumnya `one-to-one` dalam praktik — satu tindakan dibayar dalam satu rincian, namun struktur `one-to-many` memberi fleksibilitas jika satu tindakan dibayar bertahap).
- **`patients`, `branches`, `doctors` → `payments`**: relasi denormalized `one-to-many` untuk mendukung query laporan tanpa join berlapis (lihat catatan Bagian 5.13).

### 6.5 Diagram Relasi Ringkas (Naratif)

```
roles ──< users >── branches
                │         │
                │         ├──< patients (home_branch_id)
                │         ├──< appointments >── doctors ──< doctor_branch >── branches
                │         ├──< medical_records
                │         └──< payments
                │
                └── doctors (1:1 via user_id)

patients ──< appointments
patients ──< medical_records >── doctors
                                       │
medical_records ──< diagnoses
medical_records ──< treatments >── treatment_masters
medical_records ──< prescriptions
medical_records ──< odontograms
medical_records ──< patient_photos >── patients (denormalized)

medical_records ──< payments ──< payment_details >── treatments
```

---

## 7. API Design

Seluruh endpoint menggunakan prefix `/api/v1`. Response menggunakan format JSON terstandarisasi dengan struktur umum:

```
{
  "success": true|false,
  "message": "string",
  "data": { ... } atau [ ... ],
  "meta": { "pagination": { ... } }   // untuk endpoint list
}
```

Otorisasi seluruh endpoint (kecuali login) menggunakan header `Authorization: Bearer <token>`.

### 7.1 Authentication

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/v1/login` | Login pengguna. **Request:** `email`, `password`. **Response:** data user (id, name, email, role, branch), token Sanctum. |
| POST | `/api/v1/logout` | Logout — mencabut token aktif. **Request:** tidak ada body, otentikasi via Bearer token. **Response:** konfirmasi sukses. |
| GET | `/api/v1/me` | Mengambil data profil pengguna yang sedang login, termasuk role dan permission. **Response:** data user lengkap beserta role dan cabang aktif. |
| POST | `/api/v1/refresh-token` | (Opsional) Membuat ulang token jika diperlukan rotasi token — *perlu dikonfirmasi kebutuhannya, Sanctum personal access token umumnya tidak memerlukan refresh*. |

### 7.2 Patients

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/patients` | Daftar pasien dengan pagination. **Query params:** `search` (nama/NIK/no.HP/no.RM), `page`, `per_page`. **Response:** array data pasien + meta pagination. |
| POST | `/api/v1/patients` | Tambah pasien baru. **Request:** seluruh field sesuai Bagian 5.6 kecuali `id` dan `medical_record_number` (digenerate otomatis). **Response:** data pasien yang baru dibuat termasuk nomor RM yang digenerate. |
| GET | `/api/v1/patients/{id}` | Detail pasien. **Response:** data identitas pasien + ringkasan jumlah kunjungan. |
| PUT/PATCH | `/api/v1/patients/{id}` | Edit data pasien. **Request:** field yang ingin diubah. **Response:** data pasien terbaru. |
| GET | `/api/v1/patients/{id}/history` | Riwayat kunjungan pasien (appointments + medical_records ringkas). **Response:** array riwayat kunjungan terurut dari terbaru. |
| GET | `/api/v1/patients/{id}/medical-records` | Riwayat rekam medis lengkap pasien. **Response:** array rekam medis beserta sub-data (diagnoses, treatments, prescriptions, odontogram ringkas). |
| GET | `/api/v1/patients/{id}/payments` | Riwayat pembayaran pasien. **Response:** array transaksi pembayaran. |

### 7.3 Appointments

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/appointments` | Daftar appointment dengan filter. **Query params:** `date`, `branch_id`, `doctor_id`, `status`. **Response:** array appointment beserta data pasien dan dokter ringkas. |
| POST | `/api/v1/appointments` | Booking appointment baru. **Request:** `patient_id`, `doctor_id`, `branch_id`, `appointment_date`, `appointment_time`, `notes`. **Response:** data appointment yang dibuat. |
| GET | `/api/v1/appointments/{id}` | Detail appointment. |
| PUT/PATCH | `/api/v1/appointments/{id}` | Update appointment (reschedule, ubah dokter, dll.). |
| PATCH | `/api/v1/appointments/{id}/status` | Update status appointment (`checked_in`, `in_progress`, `completed`, `cancelled`, `no_show`). **Request:** `status`. **Response:** data appointment dengan status terbaru. |
| GET | `/api/v1/doctors/{id}/schedule` | Jadwal praktik dokter (untuk tampilan kalender). **Query params:** `branch_id`, `month`/`date_range`. |
| GET | `/api/v1/appointments/today` | Daftar kunjungan hari ini (shortcut untuk Daftar Kunjungan), terfilter otomatis sesuai `branch_id` pengguna. |

### 7.4 Medical Records

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/medical-records` | Daftar rekam medis dengan filter (`patient_id`, `doctor_id`, `branch_id`, `date_range`). |
| POST | `/api/v1/medical-records` | Membuat rekam medis baru beserta seluruh sub-data dalam satu request (anamnesa, diagnoses[], treatments[], prescriptions[], odontogram[]). **Request:** payload terstruktur sesuai Bagian 5.8–5.12, diproses dalam satu database transaction. **Response:** data rekam medis lengkap beserta seluruh relasi yang baru dibuat. |
| GET | `/api/v1/medical-records/{id}` | Detail rekam medis lengkap (termasuk diagnoses, treatments, prescriptions, odontogram, photos). |
| PUT/PATCH | `/api/v1/medical-records/{id}` | Update rekam medis (sesuai batasan otorisasi pada Bagian 4.2). |
| POST | `/api/v1/medical-records/{id}/photos` | Upload foto terkait rekam medis (multipart/form-data). **Request:** file, `file_type`, `caption`. **Response:** metadata foto yang tersimpan. |
| DELETE | `/api/v1/medical-records/{id}/photos/{photo_id}` | Menghapus foto (soft delete metadata, file fisik dapat tetap disimpan sesuai kebijakan retensi — *perlu dikonfirmasi*). |
| GET | `/api/v1/treatment-masters` | Daftar master tindakan & tarif (digunakan saat input tindakan pada rekam medis). |

### 7.5 Payments

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/payments` | Daftar transaksi pembayaran dengan filter (`branch_id`, `date_range`, `status`, `payment_method`). |
| POST | `/api/v1/payments` | Membuat transaksi pembayaran baru berdasarkan `medical_record_id`. **Request:** `medical_record_id`, `payment_method`, `discount_amount`, `paid_amount`, `treatment_ids[]` (item yang dibayar). **Response:** data pembayaran lengkap beserta `payment_details` dan kalkulasi kembalian (jika cash). |
| GET | `/api/v1/payments/{id}` | Detail transaksi pembayaran. |
| GET | `/api/v1/payments/{id}/receipt` | Menghasilkan data/PDF kwitansi untuk transaksi tersebut. **Response:** file PDF atau data terstruktur untuk di-generate menjadi PDF pada sisi frontend — *pendekatan generate PDF (backend vs frontend) perlu disepakati, lihat Bagian 12*. |

### 7.6 Reports

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/reports/revenue/daily` | Laporan pendapatan harian. **Query params:** `date`, `branch_id` (opsional). **Response:** total pendapatan, jumlah transaksi, breakdown per metode pembayaran. |
| GET | `/api/v1/reports/revenue/monthly` | Laporan pendapatan bulanan. **Query params:** `month`, `year`, `branch_id` (opsional). |
| GET | `/api/v1/reports/revenue/yearly` | Laporan pendapatan tahunan. **Query params:** `year`, `branch_id` (opsional). |
| GET | `/api/v1/reports/patients/new-vs-returning` | Statistik pasien baru vs pasien lama. **Query params:** `date_range`, `branch_id` (opsional). |
| GET | `/api/v1/reports/revenue/by-doctor` | Pendapatan per dokter. **Query params:** `date_range`, `branch_id` (opsional), `doctor_id` (opsional). |
| GET | `/api/v1/reports/revenue/by-branch` | Perbandingan pendapatan antar cabang. **Query params:** `date_range`. |

### 7.7 Master Data

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET / POST / PUT / DELETE | `/api/v1/branches` | CRUD data cabang (akses Owner). |
| GET / POST / PUT / DELETE | `/api/v1/doctors` | CRUD data dokter, termasuk relasi ke cabang dan jadwal (akses Owner). |
| GET / POST / PUT / DELETE | `/api/v1/treatment-masters` | CRUD master tindakan & tarif (akses Owner; GET tersedia untuk Dokter/Admin sebagai referensi). |
| GET / POST / PUT / DELETE | `/api/v1/users` | Manajemen akun pengguna sistem (akses Owner). |
| GET | `/api/v1/roles` | Daftar role yang tersedia (untuk dropdown form manajemen pengguna). |

### 7.8 Catatan Umum API Design

- Seluruh endpoint list mendukung pagination standar Laravel (`page`, `per_page`) dengan meta pagination pada response.
- Endpoint yang memerlukan filter cabang (`branch_id`) akan otomatis ter-scope sesuai cabang pengguna yang login (kecuali Owner), sehingga parameter `branch_id` pada query bersifat opsional/override hanya untuk Owner.
- Validasi request menggunakan **Form Request classes** Laravel, dengan pesan error terstruktur per field untuk kemudahan penanganan di frontend (React) dan mobile (Flutter).
- Endpoint `POST /api/v1/medical-records` merupakan endpoint kompleks yang menangani penyimpanan agregat (induk + banyak anak) dalam satu transaksi — perlu desain payload yang jelas dan didokumentasikan secara terpisah (misalnya melalui OpenAPI/Postman Collection) sebelum development Tahap 5 (Medical Records) dimulai.

---

## 8. Authentication & Authorization

### 8.1 Login

- Endpoint `POST /api/v1/login` menerima `email` dan `password`.
- Laravel memvalidasi kredensial menggunakan guard default (`web`/`api` sesuai konfigurasi), kemudian jika valid, membuat **Personal Access Token** melalui Sanctum (`$user->createToken('device-name')`).
- Token dikembalikan dalam response dan harus disimpan oleh client (React: secure storage seperti httpOnly cookie atau in-memory + refresh strategy; Flutter: secure storage perangkat).
- Response login menyertakan data user beserta `role` dan `branch_id` agar frontend dapat langsung menyesuaikan tampilan menu sesuai hak akses (sesuai `frontend.md` Bagian 3 dan 9.2).

### 8.2 Logout

- Endpoint `POST /api/v1/logout` mencabut (`revoke`) token yang sedang digunakan (`$request->user()->currentAccessToken()->delete()`).
- Setelah logout, token tidak lagi valid untuk request berikutnya — client harus menghapus token dari local storage/secure storage.
- *Perlu dikonfirmasi: apakah logout mencabut **seluruh token** milik user (logout dari semua device) atau hanya token aktif saat ini (logout dari device tersebut saja)* — disarankan hanya token aktif untuk mendukung multi-device login (web + mobile bersamaan).

### 8.3 Token

- Sanctum digunakan dalam mode **Personal Access Token (API Token)**, bukan mode SPA cookie-based, mengingat client React dan Flutter dapat berjalan dari domain/platform yang berbeda.
- Setiap token dapat diberi **abilities/scopes** (opsional) jika di masa depan dibutuhkan pembatasan akses token (misalnya token khusus untuk integrasi pihak ketiga) — pada tahap awal, abilities dapat diset sesuai role pengguna (`['*']` untuk akses penuh sesuai role).
- Token tidak memiliki masa berlaku otomatis secara default pada Sanctum — *perlu dikonfirmasi apakah dibutuhkan mekanisme expiry token (misalnya 30 hari) untuk alasan keamanan, yang dapat dikonfigurasi melalui `sanctum.expiration`*.
- Setiap login dari device/browser berbeda menghasilkan token baru, memungkinkan pengguna login dari beberapa perangkat secara bersamaan (sesuai kebutuhan web + mobile).

### 8.4 Permission

- Permission diimplementasikan melalui kombinasi:
  1. **Role check** (middleware `role:`) — membatasi akses ke kelompok endpoint berdasarkan role (Admin/Dokter/Owner) sesuai matriks pada Bagian 4.
  2. **Policy/Gate** — otorisasi granular pada level objek (misalnya "Dokter hanya dapat mengedit rekam medis miliknya sendiri", "Admin hanya dapat memproses pembayaran di cabangnya").
  3. **Branch Scope** — Global Scope Eloquent yang otomatis memfilter data berdasarkan `branch_id` pengguna (kecuali Owner).
- Setiap percobaan akses yang tidak diizinkan mengembalikan response `403 Forbidden` dengan pesan yang konsisten.

### 8.5 Middleware

| Middleware | Fungsi |
|---|---|
| `auth:sanctum` | Memastikan request memiliki token valid; menempatkan user yang login pada `$request->user()`. |
| `role:admin` / `role:doctor` / `role:owner` | Membatasi akses route group hanya untuk role tertentu (dapat menerima multiple roles, misalnya `role:doctor,owner`). |
| `branch.scope` (custom, opsional) | Menyisipkan filter `branch_id` otomatis pada query builder untuk request yang memerlukan scoping cabang — alternatif/pelengkap dari Global Scope pada model. |
| `throttle:api` | Rate limiting standar Laravel untuk mencegah abuse pada endpoint API, terutama endpoint login. |

### 8.6 Alur Autentikasi Ringkas

```
1. Client (React/Flutter) → POST /api/v1/login (email, password)
2. Laravel memvalidasi kredensial
3. Jika valid → generate Sanctum token → response (user data + token)
4. Client menyimpan token secara aman
5. Setiap request berikutnya → header "Authorization: Bearer <token>"
6. Middleware auth:sanctum memvalidasi token → set $request->user()
7. Middleware role/policy memvalidasi otorisasi sesuai endpoint
8. Controller memproses request, Global Scope branch otomatis aktif (jika bukan Owner)
9. Logout → POST /api/v1/logout → token dicabut
```

---

## 9. File Management

### 9.1 Jenis File yang Dikelola

| Jenis File | Sumber | Tabel Metadata |
|---|---|---|
| Foto Pasien (kondisi gigi/mulut) | Upload oleh Dokter saat mengisi rekam medis | `patient_photos` |
| Foto Tindakan (before/after) | Upload oleh Dokter, dikategorikan melalui `file_type` | `patient_photos` |
| Lampiran Rekam Medis (misalnya hasil rontgen, dokumen pendukung) | Upload oleh Dokter/Admin | `patient_photos` (dengan `file_type` sesuai kategori) |
| Tanda tangan digital dokter (opsional) | Upload oleh Owner/Admin saat setup profil dokter | `doctors.signature_image_path` |

### 9.2 Strategi Penyimpanan

- Laravel **Filesystem abstraction** digunakan untuk mengabstraksi lokasi penyimpanan, dikonfigurasi melalui `config/filesystems.php` dengan disk:
  - `local` / `public` — untuk environment development.
  - `r2` (S3-compatible driver) — untuk environment production, menggunakan Cloudflare R2.
- Disk aktif ditentukan melalui environment variable (`FILESYSTEM_DISK`), sehingga perpindahan dari local ke R2 tidak memerlukan perubahan kode, hanya konfigurasi.
- Struktur direktori penyimpanan disarankan terorganisir per jenis dan konteks, contoh: `patients/{patient_id}/medical-records/{medical_record_id}/photos/{filename}`.

### 9.3 Proses Upload

1. Client mengirimkan file melalui `multipart/form-data` ke endpoint terkait (misalnya `POST /api/v1/medical-records/{id}/photos`).
2. Backend melakukan validasi: tipe file (jpg, png, pdf untuk lampiran tertentu), ukuran maksimum (*perlu disepakati, misalnya maksimum 5MB per file*), dan jumlah file per request.
3. File disimpan ke disk aktif (`local` atau `r2`) dengan nama file yang di-generate otomatis (hash/UUID) untuk menghindari konflik nama.
4. Metadata file (path, tipe, caption, relasi ke `medical_record_id`/`patient_id`) disimpan ke tabel `patient_photos`.
5. Response mengembalikan metadata file termasuk URL akses.

### 9.4 Akses dan Keamanan File

- Mengingat foto pasien bersifat **data medis sensitif**, disarankan:
  - Jika menggunakan Cloudflare R2 dengan bucket **private**, akses file menggunakan **signed URL** (temporary URL) yang digenerate oleh backend saat dibutuhkan, dengan masa berlaku terbatas (misalnya 15–60 menit).
  - Jika menggunakan Local Storage pada development, file disajikan melalui route terlindungi (`auth:sanctum`) yang memverifikasi hak akses pengguna terhadap pasien terkait sebelum menyajikan file (bukan melalui public storage link langsung).
- *Perlu dikonfirmasi kebijakan privasi data foto pasien sesuai regulasi yang berlaku (misalnya UU PDP di Indonesia), untuk menentukan apakah signed URL wajib digunakan pada seluruh environment, termasuk development.*

### 9.5 Retensi dan Penghapusan

- Penghapusan foto melalui API (`DELETE /api/v1/medical-records/{id}/photos/{photo_id}`) pada tahap awal disarankan berupa **soft delete metadata** (kolom `deleted_at` pada `patient_photos`), tanpa menghapus file fisik secara langsung — penghapusan file fisik dapat dilakukan melalui proses terjadwal (scheduled job) setelah periode tertentu.
- *Perlu dikonfirmasi kebijakan retensi final: berapa lama foto disimpan, apakah ada batas kuota storage per cabang, dan siapa yang berwenang menghapus foto secara permanen.*

---

## 10. Reporting Architecture

### 10.1 Prinsip Umum

Seluruh laporan dihasilkan melalui **query agregasi** terhadap tabel `payments` (sebagai sumber data pendapatan) dan `patients`/`appointments` (sebagai sumber data statistik pasien), dengan memanfaatkan kolom denormalized (`branch_id`, `doctor_id`, `patient_id`) pada tabel `payments` untuk menghindari join berlapis (lihat catatan Bagian 5.13).

Setiap endpoint laporan mendukung parameter filter umum:
- `date` / `date_range` (rentang tanggal, *custom date range dipertimbangkan sesuai Open Questions frontend.md poin 23*).
- `branch_id` (opsional — jika tidak diisi oleh Owner, laporan mencakup seluruh cabang; untuk Admin, otomatis ter-scope ke cabangnya).

### 10.2 Laporan Pendapatan Harian

- **Sumber data:** `payments` dengan status `paid`, difilter berdasarkan `paid_at` pada tanggal yang diminta.
- **Agregasi:** `SUM(final_amount)`, `COUNT(*)` (jumlah transaksi), breakdown berdasarkan `payment_method` (cash vs transfer).
- **Output:** total pendapatan hari tersebut, jumlah transaksi, breakdown metode pembayaran, dan opsional daftar transaksi detail.

### 10.3 Laporan Pendapatan Bulanan & Tahunan

- **Sumber data:** sama dengan laporan harian, namun agregasi dikelompokkan berdasarkan tanggal (`GROUP BY DATE(paid_at)` untuk bulanan menghasilkan tren harian dalam satu bulan, `GROUP BY MONTH(paid_at)` untuk tahunan menghasilkan tren bulanan dalam satu tahun).
- **Output:** total agregat periode + array data tren (untuk divisualisasikan sebagai grafik pada frontend sesuai `frontend.md` Bagian 8.7).

### 10.4 Laporan Pasien Baru vs Pasien Lama

- **Definisi "Pasien Baru":** pasien dengan `patients.created_at` (atau kunjungan pertama melalui `medical_records`/`appointments`) yang jatuh dalam rentang periode laporan.
- **Definisi "Pasien Lama":** pasien yang melakukan kunjungan (`medical_records`) dalam periode laporan, namun `patients.created_at` (atau kunjungan pertama) berada **sebelum** rentang periode tersebut.
- **Sumber data:** `medical_records` (untuk menghitung kunjungan dalam periode) di-join dengan `patients` (untuk mengecek tanggal pendaftaran/kunjungan pertama).
- **Output:** jumlah pasien baru, jumlah kunjungan pasien lama, dan rasio/perbandingan dalam bentuk yang dapat divisualisasikan sebagai grafik perbandingan.

### 10.5 Laporan Pendapatan per Dokter

- **Sumber data:** `payments` dengan status `paid`, dikelompokkan berdasarkan `doctor_id`, difilter `date_range` dan opsional `branch_id`.
- **Output:** daftar dokter beserta total pendapatan yang dihasilkan, jumlah pasien yang ditangani, dan jumlah tindakan — dapat diurutkan untuk menampilkan ranking performa dokter.

### 10.6 Laporan Pendapatan per Cabang

- **Sumber data:** `payments` dengan status `paid`, dikelompokkan berdasarkan `branch_id`, difilter `date_range`.
- **Output:** daftar cabang beserta total pendapatan, jumlah transaksi, dan jumlah pasien — untuk perbandingan performa antar cabang (akses Owner, sesuai Bagian 4.3).

### 10.7 Pertimbangan Performa

- Untuk volume data yang besar (multi-tahun, multi-cabang), pertimbangkan penggunaan **database view** atau **materialized view** PostgreSQL untuk laporan yang sering diakses (misalnya ringkasan pendapatan harian per cabang), yang di-refresh secara terjadwal.
- Index pada kolom `paid_at`, `branch_id`, `doctor_id`, dan `status` pada tabel `payments` bersifat krusial untuk performa seluruh endpoint laporan.
- *Pada tahap awal (volume data masih kecil), query langsung (real-time aggregation) cukup memadai; optimasi materialized view dapat ditunda hingga ada indikasi masalah performa.*

---

## 11. Development Roadmap

Roadmap pengerjaan backend disusun sejalan dengan roadmap frontend (`frontend.md` Bagian 10), dengan urutan sebagai berikut:

### Tahap 1 — Authentication
- Setup project Laravel 12 + konfigurasi PostgreSQL + Sanctum.
- Migrasi tabel `users`, `roles`, `branches` (minimal untuk keperluan relasi user-branch).
- Endpoint: `login`, `logout`, `me`.
- Middleware `auth:sanctum` dan `role:*`.
- Seeder akun awal untuk masing-masing role (Admin, Dokter, Owner) untuk keperluan testing oleh tim frontend.

### Tahap 2 — Master Data
- Migrasi tabel `branches` (lengkap), `doctors`, `doctor_branch`, `treatment_masters`, `roles` (lengkap).
- Endpoint CRUD Master Data (Bagian 7.7).
- Seeder data 3 cabang, daftar dokter awal, dan daftar tindakan & tarif (berdasarkan data yang diberikan client).

### Tahap 3 — Patients
- Migrasi tabel `patients`.
- Logika generate `medical_record_number` otomatis.
- Endpoint CRUD Pasien + pencarian (Bagian 7.2).
- Implementasi Branch Scope pada query pasien (jika berlaku — *menyesuaikan keputusan akses lintas cabang pada Bagian 4.1*).

### Tahap 4 — Appointments
- Migrasi tabel `appointments`.
- Endpoint Booking, Jadwal Dokter, Daftar Kunjungan Hari Ini (Bagian 7.3).
- Logika update status appointment.

### Tahap 5 — Medical Records
- Migrasi tabel `medical_records`, `diagnoses`, `treatments`, `prescriptions`, `odontograms`, `patient_photos`.
- Endpoint pembuatan rekam medis agregat (`POST /api/v1/medical-records`) dengan database transaction.
- Endpoint upload foto + integrasi file storage (R2/Local — Bagian 9).
- Endpoint riwayat rekam medis pasien.
- **Prasyarat:** finalisasi struktur odontogram (notasi gigi, daftar kondisi) bersama dokter sebelum tahap ini dimulai (sesuai catatan `frontend.md` Bagian 6.7).

### Tahap 6 — Payments
- Migrasi tabel `payments`, `payment_details`.
- Logika generate `invoice_number` otomatis.
- Endpoint pembuatan pembayaran berdasarkan rekam medis, kalkulasi total/diskon/kembalian.
- Endpoint cetak/generate data kwitansi.

### Tahap 7 — Reports
- Implementasi seluruh endpoint laporan (Bagian 10).
- Optimasi index pada kolom-kolom kunci laporan.
- (Opsional) Setup materialized view jika dibutuhkan untuk performa.

### Catatan Roadmap

- Setiap tahap sebaiknya disertai **dokumentasi API** (misalnya melalui Postman Collection atau OpenAPI/Swagger) yang diperbarui secara berkala agar tim frontend (React & Flutter) dapat melakukan development secara paralel.
- Tahap 4 (Appointments) dan Tahap 2 (Master Data) merupakan dependensi penting untuk Tahap 5 (Medical Records) — pastikan kedua tahap ini selesai sebelum Tahap 5 dimulai, sejalan dengan catatan pada `frontend.md` Bagian 10 mengenai penempatan Modul Appointment.

---

## 12. Risks and Technical Considerations

### 12.1 Keputusan Arsitektur yang Perlu Disepakati Lebih Lanjut

1. **Primary Key Strategy** — penggunaan `bigint auto-increment` vs `UUID` untuk tabel-tabel utama (`patients`, `medical_records`). UUID memberikan keuntungan jika di masa depan dibutuhkan sinkronisasi data lintas sistem atau database terdistribusi, namun bigint lebih sederhana dan performant untuk skala saat ini. **Rekomendasi:** bigint auto-increment untuk tahap awal, dengan kemungkinan menambahkan kolom UUID sebagai identifier publik jika dibutuhkan di masa depan.

2. **Relasi `medical_records` ↔ `payments`** — diasumsikan `one-to-one` pada tahap awal. Jika fitur cicilan/pembayaran bertahap dikonfirmasi dibutuhkan (sesuai Open Question frontend.md poin 19), relasi ini perlu diubah menjadi `one-to-many` dengan penyesuaian pada status pembayaran dan kalkulasi sisa tagihan.

3. **Generate PDF Kwitansi** — perlu disepakati apakah PDF di-generate di **backend** (menggunakan library seperti `barryvdh/laravel-dompdf` atau sejenisnya) dan dikirim sebagai file, atau backend hanya menyediakan **data terstruktur** dan PDF di-generate di sisi **frontend** (React, menggunakan library seperti `jsPDF` atau `react-pdf`). Pendekatan ini mempengaruhi desain endpoint `GET /api/v1/payments/{id}/receipt`.

4. **Peruntukan Aplikasi Flutter** — perlu dikonfirmasi apakah aplikasi mobile diperuntukkan untuk staf internal (Dokter/Owner dengan akses sama seperti web) atau untuk pasien (memerlukan guard/role tambahan, misalnya untuk self-booking appointment). Hal ini mempengaruhi desain endpoint autentikasi dan permission.

5. **Mekanisme Pemilihan Cabang Aktif** — untuk Owner dan dokter yang bertugas di lebih dari satu cabang, perlu disepakati apakah cabang aktif dipilih saat login, disimpan sebagai preferensi, atau dipilih per request melalui parameter.

### 12.2 Risiko Teknis

1. **Konsistensi Data pada Operasi Agregat** — endpoint `POST /api/v1/medical-records` menulis ke banyak tabel sekaligus (medical_records + diagnoses + treatments + prescriptions + odontograms). Kegagalan parsial dapat menyebabkan data tidak konsisten jika tidak dibungkus dalam database transaction yang benar. **Mitigasi:** wajib menggunakan `DB::transaction()` dengan rollback otomatis pada kegagalan, serta unit test khusus untuk skenario kegagalan parsial.

2. **Snapshot vs Referensi Master Data** — tabel `treatments` dan `payment_details` menyimpan snapshot harga/nama dari `treatment_masters`. Jika tim development tidak konsisten menerapkan pola snapshot ini (misalnya melakukan join langsung ke master untuk menampilkan harga), data historis dapat berubah secara tidak sengaja saat master diperbarui. **Mitigasi:** dokumentasi internal yang jelas dan code review khusus untuk area ini.

3. **Migrasi Data dari Sistem Manual** — sesuai `frontend.md` Bagian 11.8, data pasien dan rekam medis lama dalam format kertas/Excel memerlukan proses migrasi terpisah. Struktur tabel `patients` dan `medical_records` perlu mengakomodasi kemungkinan **import data massal** (misalnya melalui seeder/import script khusus), termasuk penanganan data yang tidak lengkap (misalnya NIK kosong, tanggal lahir tidak diketahui).

4. **Keamanan Data Medis Sensitif** — foto pasien dan rekam medis merupakan data sensitif. Risiko kebocoran data melalui URL publik yang tidak terlindungi (misalnya public bucket R2 tanpa signed URL) perlu dimitigasi sejak awal desain (lihat Bagian 9.4).

5. **Skalabilitas Query Laporan** — seiring pertumbuhan data transaksi dari 3 cabang dalam jangka panjang, query agregasi real-time pada endpoint laporan (Bagian 10) dapat mengalami penurunan performa. **Mitigasi:** monitoring query performance sejak awal, indexing yang tepat, dan kesiapan migrasi ke materialized view jika diperlukan.

6. **Validasi Nomor Rekam Medis dan Invoice Unik di Lingkungan Concurrent** — generate `medical_record_number` dan `invoice_number` secara otomatis berpotensi mengalami race condition jika dua transaksi terjadi bersamaan pada cabang yang sama. **Mitigasi:** penggunaan database sequence per cabang atau locking mechanism (`lockForUpdate`) saat generate nomor.

7. **Dependensi Eksternal (Cloudflare R2)** — jika layanan R2 mengalami gangguan, fitur upload/akses foto akan terdampak. **Mitigasi:** pertimbangkan retry mechanism dan fallback ke local storage pada environment tertentu, serta monitoring ketersediaan layanan storage.

### 12.3 Pertanyaan Terbuka untuk Client (Tambahan dari Sisi Backend)

8. Apakah dibutuhkan **audit log** (siapa mengubah data apa dan kapan) untuk data sensitif seperti rekam medis dan pembayaran, mengingat kebutuhan kepatuhan terhadap regulasi data medis?
9. Apakah dibutuhkan fitur **export data** (misalnya backup berkala database, atau export laporan ke format Excel/CSV) sebagai bagian dari deliverable backend?
10. Bagaimana kebijakan **backup database** dan **disaster recovery** yang diharapkan (frekuensi backup, retensi, lokasi penyimpanan backup)?
11. Apakah dibutuhkan **rate limiting** khusus atau pembatasan akses berdasarkan IP untuk endpoint tertentu (misalnya endpoint laporan keuangan) sebagai lapisan keamanan tambahan?

---

*Dokumen ini bersifat hidup (living document) dan saling terhubung dengan `frontend.md`. Setiap perubahan pada struktur database, API, atau keputusan arsitektur pada dokumen ini perlu disinkronkan dengan dokumen `frontend.md`, khususnya pada bagian Sitemap, Wireframe Planning, dan Risks and Open Questions.*
