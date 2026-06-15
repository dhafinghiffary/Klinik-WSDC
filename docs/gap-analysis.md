# Gap Analysis — Widya Santi Dental Care (WSDC)

**Versi Dokumen:** 1.0  
**Tanggal:** 15 Juni 2026  
**Sumber Analisis:** `frontend.md` v1.0 + `backend.md` v1.0  
**Audience:** System Analyst, Project Manager, Client Relation  
**Status:** Draft untuk review

---

## Ringkasan Eksekutif

Analisis ini mengidentifikasi kesenjangan antara spesifikasi `frontend.md` dan `backend.md`. Ditemukan **27 temuan** yang dikategorikan sebagai: Missing Requirements (MR), Contradicting Requirements (CR), Ambiguous Requirements (AR), Missing Business Rules (MBR), Missing User Permissions (MUP), Missing Database Entities (MDE), dan Missing Frontend Pages (MFP).

---

## Tabel Temuan

| ID | Kategori | Temuan | Severity | Rekomendasi | Usulan Solusi |
|---|---|---|---|---|---|
| CR-01 | Contradicting Requirement | Relasi payment ↔ medical\_record | HIGH | Tentukan pendekatan sebelum migrasi schema | Lihat detail di bawah |
| CR-02 | Contradicting Requirement | Hak akses Admin ke rekam medis | HIGH | Konfirmasi langsung ke client | Lihat detail di bawah |
| CR-03 | Contradicting Requirement | Hak akses Admin ke laporan | MEDIUM | Konfirmasi ke client per cabang | Lihat detail di bawah |
| AR-01 | Ambiguous Requirement | NIK: wajib atau opsional? | HIGH | Konfirmasi ke client | Lihat detail di bawah |
| AR-02 | Ambiguous Requirement | Odontogram: historis per kunjungan atau kumulatif | HIGH | Keputusan sebelum Tahap 3 dimulai | Lihat detail di bawah |
| AR-03 | Ambiguous Requirement | Dokter boleh edit rekam medis lama? | HIGH | Konfirmasi ke client + dokter | Lihat detail di bawah |
| AR-04 | Ambiguous Requirement | Cabang aktif dokter multi-cabang dipilih saat apa? | MEDIUM | Tentukan mekanisme teknis | Lihat detail di bawah |
| AR-05 | Ambiguous Requirement | Generate PDF kwitansi di backend atau frontend? | MEDIUM | Kesepakatan tim teknis | Lihat detail di bawah |
| AR-06 | Ambiguous Requirement | Logout mencabut satu token atau semua token? | LOW | Konfirmasi ke client | Lihat detail di bawah |
| AR-07 | Ambiguous Requirement | Format nomor rekam medis dan kwitansi | MEDIUM | Konfirmasi ke client sebelum seed data | Lihat detail di bawah |
| MR-01 | Missing Requirement | Alur reset password tidak didefinisikan | HIGH | Definisikan alur dan endpoint | Lihat detail di bawah |
| MR-02 | Missing Requirement | Field alergi obat dan penyakit sistemik pasien | HIGH | Konfirmasi dan tambahkan ke schema | Lihat detail di bawah |
| MR-03 | Missing Requirement | Data wali/orang tua untuk pasien anak | MEDIUM | Tambahkan ke form dan schema | Lihat detail di bawah |
| MR-04 | Missing Requirement | Notifikasi reminder appointment | LOW | Definisikan scope tahap awal vs lanjutan | Lihat detail di bawah |
| MR-05 | Missing Requirement | Ekspor laporan ke Excel/PDF | MEDIUM | Tentukan format dan endpoint | Lihat detail di bawah |
| MR-06 | Missing Requirement | Daftar kode kondisi odontogram | HIGH | Finalisasi bersama dokter sebelum Tahap 3 | Lihat detail di bawah |
| MR-07 | Missing Requirement | Mekanisme diskon (persentase/nominal/per tindakan) | MEDIUM | Konfirmasi ke client | Lihat detail di bawah |
| MR-08 | Missing Requirement | Pembayaran cicilan/bertahap | LOW | Konfirmasi ke client, tentukan dampak schema | Lihat detail di bawah |
| MR-09 | Missing Requirement | Peruntukan dan role Flutter mobile app | HIGH | Konfirmasi ke client sebelum pengembangan API | Lihat detail di bawah |
| MR-10 | Missing Requirement | Halaman manajemen akun pribadi (profil, ubah password) | MEDIUM | Tambahkan ke sitemap | Lihat detail di bawah |
| MR-11 | Missing Requirement | Audit log perubahan data sensitif | MEDIUM | Konfirmasi kebutuhan regulasi | Lihat detail di bawah |
| MBR-01 | Missing Business Rule | Aturan pembatalan appointment | MEDIUM | Definisikan rules bisnis | Lihat detail di bawah |
| MBR-02 | Missing Business Rule | Validasi tarif tindakan per cabang vs global | HIGH | Konfirmasi ke client sebelum seed master data | Lihat detail di bawah |
| MBR-03 | Missing Business Rule | Definisi "pasien baru" vs "pasien lama" lintas cabang | MEDIUM | Klarifikasi logika laporan | Lihat detail di bawah |
| MUP-01 | Missing User Permission | Role Super Admin tidak terdefinisi | HIGH | Konfirmasi dan definisikan jika diperlukan | Lihat detail di bawah |
| MUP-02 | Missing User Permission | Akses Admin ke data pasien lintas cabang | HIGH | Konfirmasi skenario pasien pindah cabang | Lihat detail di bawah |
| MDE-01 | Missing Database Entity | Tabel `patient_guardians` untuk pasien anak | MEDIUM | Tambahkan ke ERD jika field wali dikonfirmasi | Lihat detail di bawah |
| MDE-02 | Missing Database Entity | Tabel `patient_allergies` atau field alergi | HIGH | Tambahkan ke ERD dan form pasien | Lihat detail di bawah |
| MDE-03 | Missing Database Entity | Tabel `audit_logs` | MEDIUM | Tambahkan jika audit log dikonfirmasi | Lihat detail di bawah |
| MFP-01 | Missing Frontend Page | Halaman Profil Akun / Ubah Password | MEDIUM | Tambahkan ke sitemap | Lihat detail di bawah |
| MFP-02 | Missing Frontend Page | Halaman 403 Unauthorized | MEDIUM | Diperlukan untuk proteksi route per role | Lihat detail di bawah |
| MFP-03 | Missing Frontend Page | Halaman 404 Not Found | LOW | Standar UX | Lihat detail di bawah |
| MFP-04 | Missing Frontend Page | Halaman Reset Password | HIGH | Wajib jika fitur lupa password ada | Lihat detail di bawah |
| MFP-05 | Missing Frontend Page | Halaman Master Data Dokter (detail/form) | MEDIUM | Disebutkan di sitemap tapi tidak ada wireframe | Lihat detail di bawah |

---

## Detail Temuan

### CR-01 — Relasi `payments` ↔ `medical_records` Kontradiktif

**Severity:** HIGH

**Temuan:**  
`backend.md` Bagian 5.8 menyebutkan relasi `hasOne Payment` dengan catatan "*atau `hasMany` jika fitur cicilan diaktifkan*". Bagian 6.4 dan 12.1 kembali membahas hal yang sama tanpa resolusi akhir. Kondisi ini menyebabkan ketidakpastian pada desain schema dan logika kalkulasi pembayaran.

**Rekomendasi:**  
Tentukan apakah cicilan masuk scope tahap awal atau tidak. Jika tidak, gunakan `one-to-one` secara eksplisit dan dokumentasikan sebagai keputusan arsitektur yang disengaja.

**Usulan Solusi:**  
- Tahap awal: `one-to-one` (`payment_id` nullable pada `medical_records` atau constraint unique `medical_record_id` pada `payments`).
- Jika cicilan dikonfirmasi: ubah relasi menjadi `one-to-many`, tambahkan kolom `remaining_amount` pada `payments`, dan tambahkan logika status `partial`.

---

### CR-02 — Hak Akses Admin ke Rekam Medis Kontradiktif

**Severity:** HIGH

**Temuan:**  
`frontend.md` Bagian 3.1 menyatakan Admin memiliki akses "lihat saja (read-only) ke Modul Rekam Medis, terbatas pada riwayat tindakan untuk keperluan administrasi". `backend.md` Bagian 4.1 mengkonfirmasi read-only namun menambahkan tanda "*perlu dikonfirmasi cakupan detail*". Keduanya tidak konsisten mendefinisikan apakah Admin dapat melihat anamnesa, diagnosa, resep, dan foto — atau hanya daftar tindakan dan nominal.

**Rekomendasi:**  
Konfirmasi langsung ke client: apakah Admin perlu melihat detail klinis (anamnesa, diagnosa) ataukah hanya ringkasan tindakan dan biaya untuk proses billing?

**Usulan Solusi:**  
Definisikan dua endpoint berbeda:
- `GET /api/v1/medical-records/{id}/summary` — hanya tindakan dan total biaya (untuk Admin).
- `GET /api/v1/medical-records/{id}` — detail penuh termasuk klinis (hanya untuk Dokter dan Owner).

---

### CR-03 — Hak Akses Admin ke Laporan Cabang Kontradiktif

**Severity:** MEDIUM

**Temuan:**  
`frontend.md` Bagian 3.1 menyatakan Admin "tidak memiliki akses ke Modul Laporan keuangan tingkat klinik secara keseluruhan" namun menambahkan "*perlu dikonfirmasi apakah admin cabang boleh melihat laporan cabangnya sendiri*". `backend.md` Bagian 4.1 tabel menuliskan "❌ atau ✅ terbatas pada cabangnya". Dua dokumen tidak mencapai kesepakatan.

**Rekomendasi:**  
Konfirmasi ke client. Disarankan Admin memiliki akses laporan terbatas untuk cabangnya (pendapatan harian saja) untuk mendukung rekonsiliasi kasir harian.

**Usulan Solusi:**  
Tambahkan permission granular pada endpoint laporan:
- `reports.daily.own_branch` — diizinkan untuk Admin.
- `reports.monthly/yearly/branch-comparison` — hanya Owner.

---

### AR-01 — NIK: Wajib atau Opsional?

**Severity:** HIGH

**Temuan:**  
`frontend.md` Bagian 5 menandai NIK sebagai "Ya/Opsional*" dengan catatan pasien anak dan WNA. `backend.md` Bagian 5.6 mendefinisikan NIK sebagai `nullable, unique (jika tidak null)`. Logika validasi form frontend dan constraint database perlu konsisten.

**Rekomendasi:**  
Konfirmasi ke client. NIK sebaiknya opsional dengan validasi format 16 digit hanya jika diisi.

**Usulan Solusi:**  
- Database: `nik VARCHAR(16) NULLABLE, UNIQUE WHERE nik IS NOT NULL` (partial unique index PostgreSQL).
- Frontend: NIK opsional, validasi format 16 digit jika diisi, tidak boleh duplikasi dengan pasien lain.

---

### AR-02 — Odontogram: Historis per Kunjungan atau Kumulatif?

**Severity:** HIGH

**Temuan:**  
`frontend.md` Bagian 6.6 menyebutkan dua pendekatan ("historis per kunjungan" atau "kondisi terkini yang terus diperbarui") dan meminta konfirmasi. `backend.md` Bagian 2.2 memutuskan pendekatan historis, namun `frontend.md` belum diupdate untuk mencerminkan keputusan ini. Terdapat inkonsistensi antar dokumen.

**Rekomendasi:**  
Adopsi keputusan `backend.md` (historis per kunjungan) dan update `frontend.md` Bagian 6.6.

**Usulan Solusi:**  
- Schema: tabel `odontograms` dengan relasi ke `medical_record_id` (sudah sesuai `backend.md` Bagian 5.12).
- Frontend: tampilkan odontogram terbaru sebagai kondisi terkini, dengan opsi lihat riwayat odontogram per kunjungan dari tab Riwayat Rekam Medis.

---

### AR-03 — Dokter Boleh Edit Rekam Medis Lama?

**Severity:** HIGH

**Temuan:**  
`frontend.md` Bagian 3.2 dan `backend.md` Bagian 4.2 keduanya menempatkan tanda "*perlu dikonfirmasi*" untuk apakah dokter dapat mengedit rekam medis dari kunjungan sebelumnya. Ini mempengaruhi desain endpoint `PUT /api/v1/medical-records/{id}` dan logika Policy.

**Rekomendasi:**  
Secara medis, rekam medis seharusnya immutable setelah ditandatangani. Disarankan hanya memperbolehkan penambahan catatan (addendum), bukan edit langsung.

**Usulan Solusi:**  
Tambahkan tabel `medical_record_amendments` yang menyimpan catatan tambahan dokter dengan relasi ke `medical_record_id`. Rekam medis induk menjadi read-only setelah dikunci (misalnya 24 jam setelah dibuat atau setelah status appointment = `completed`).

---

### AR-04 — Mekanisme Pemilihan Cabang Aktif Dokter Multi-Cabang

**Severity:** MEDIUM

**Temuan:**  
`backend.md` Bagian 4.2 dan 12.1 menyebutkan mekanisme pemilihan cabang aktif untuk dokter yang bertugas di lebih dari satu cabang belum ditentukan (dipilih saat login? otomatis berdasarkan jadwal?).

**Rekomendasi:**  
Pilih cabang aktif saat login. Response endpoint `GET /api/v1/me` menyertakan daftar cabang yang dapat dipilih, dan dokter memilih cabang aktif melalui mekanisme switch-branch.

**Usulan Solusi:**  
Tambahkan endpoint `POST /api/v1/me/switch-branch` dengan request `{ branch_id }`. Token tidak perlu diperbarui — cukup simpan `active_branch_id` pada session/metadata token Sanctum sebagai abilities/claim.

---

### AR-05 — Generate PDF Kwitansi: Backend atau Frontend?

**Severity:** MEDIUM

**Temuan:**  
`backend.md` Bagian 12.1 poin 3 dan `frontend.md` Bagian 8.6 keduanya menyebutkan pendekatan ini perlu disepakati tanpa resolusi.

**Rekomendasi:**  
Generate PDF di backend menggunakan `barryvdh/laravel-dompdf` agar format kwitansi konsisten di semua client (web dan mobile).

**Usulan Solusi:**  
Endpoint `GET /api/v1/payments/{id}/receipt` mengembalikan file PDF (`Content-Type: application/pdf`). Frontend hanya perlu trigger download/print tanpa logika PDF.

---

### AR-06 — Logout: Satu Token atau Semua Token?

**Severity:** LOW

**Temuan:**  
`backend.md` Bagian 8.2 menyebutkan pilihan ini tapi tidak memutuskan.

**Rekomendasi:**  
Default logout hanya mencabut token aktif (mendukung multi-device). Tambahkan endpoint opsional `POST /api/v1/logout/all` untuk logout dari semua perangkat.

---

### AR-07 — Format Nomor Rekam Medis dan Nomor Kwitansi

**Severity:** MEDIUM

**Temuan:**  
`backend.md` Bagian 5.6 menyebut format contoh `{kode_cabang}-{tahun}-{nomor_urut}` dan Bagian 5.13 menyebut `{kode_cabang}-{tahun}{bulan}-{nomor_urut}`, namun format final belum dikonfirmasi ke client.

**Rekomendasi:**  
Konfirmasi ke client apakah format manual lama perlu diikuti (untuk continuity data), atau dapat menggunakan format baru yang lebih sistematis.

**Usulan Solusi:**  
- Nomor RM: `{KODE_CABANG}-{YYYY}-{NNNNNN}` (misal: `WSA-2026-000001`).
- Nomor Kwitansi: `INV-{KODE_CABANG}-{YYYYMM}-{NNNN}` (misal: `INV-WSA-202606-0001`).
- Gunakan PostgreSQL sequence per cabang per tahun untuk menghindari race condition.

---

### MR-01 — Alur Reset Password Tidak Didefinisikan

**Severity:** HIGH

**Temuan:**  
`frontend.md` Bagian 8.1 menyebutkan link "Lupa Password" sebagai opsional dengan catatan "*perlu dikonfirmasi mekanismenya*". Tidak ada endpoint atau alur yang didefinisikan di kedua dokumen.

**Rekomendasi:**  
Definisikan alur reset password sebelum Tahap 1 development dimulai.

**Usulan Solusi:**  
- Endpoint `POST /api/v1/forgot-password` — kirim email reset.
- Endpoint `POST /api/v1/reset-password` — verifikasi token dan update password.
- Frontend: halaman "Lupa Password" dan halaman "Reset Password" (lihat MFP-04).
- Karena user adalah staf internal, Owner dapat mereset password via manajemen pengguna sebagai alternatif.

---

### MR-02 — Field Alergi Obat dan Penyakit Sistemik Pasien

**Severity:** HIGH

**Temuan:**  
`frontend.md` Bagian 5.1 dan 6.1 menyebutkan kemungkinan mencatat riwayat alergi obat dan penyakit sistemik (diabetes, hipertensi) namun tidak memutuskan apakah di profil pasien (permanen) atau di anamnesa per kunjungan.

**Rekomendasi:**  
Data alergi obat dan penyakit sistemik harus ada di profil pasien sebagai data permanen karena relevan untuk setiap kunjungan (dokter perlu melihatnya sebelum meresepkan obat).

**Usulan Solusi:**  
Tambahkan tabel `patient_medical_histories` atau kolom `drug_allergy` (text, nullable) dan `systemic_conditions` (text, nullable) pada tabel `patients`. Tampilkan sebagai peringatan (alert banner) pada header form rekam medis saat dokter membuka kunjungan pasien baru.

---

### MR-03 — Data Wali/Orang Tua untuk Pasien Anak

**Severity:** MEDIUM

**Temuan:**  
`frontend.md` Bagian 5.1 menyebutkan kemungkinan field nama orang tua/wali untuk pasien anak namun tidak diputuskan.

**Rekomendasi:**  
Tambahkan field opsional untuk pasien anak. Definisi "pasien anak" dapat berdasarkan tanggal lahir (usia < 17 tahun).

**Usulan Solusi:**  
Tambahkan kolom pada tabel `patients`: `guardian_name` (varchar, nullable), `guardian_phone` (varchar, nullable), `guardian_relation` (varchar, nullable). Field ini muncul di form jika pasien berusia < 17 tahun.

---

### MR-04 — Notifikasi Reminder Appointment

**Severity:** LOW

**Temuan:**  
`frontend.md` Bagian 4.6 dan 11.5 menyebutkan notifikasi WhatsApp/email sebagai kemungkinan, dan `backend.md` Bagian 1.1 menyebutkan integrasi WhatsApp di luar scope tahap awal. Tidak ada definisi jelas tentang kapan fitur ini masuk scope.

**Rekomendasi:**  
Desain schema `appointments` sudah memiliki `notes` yang cukup. Persiapkan infrastruktur (kolom `reminder_sent_at` nullable) untuk tahap lanjutan tanpa memblokir pengembangan saat ini.

---

### MR-05 — Ekspor Laporan ke Excel/PDF

**Severity:** MEDIUM

**Temuan:**  
`frontend.md` Bagian 4.6 dan 11.6 menyebutkan ekspor laporan sebagai pertanyaan terbuka. `backend.md` Bagian 12.3 poin 9 juga menyebutkan ini sebagai open question.

**Rekomendasi:**  
Konfirmasi ke client. Ekspor Excel sangat umum digunakan oleh Owner untuk analisis keuangan di luar sistem.

**Usulan Solusi:**  
Tambahkan parameter `format=excel|pdf` pada seluruh endpoint laporan. Backend menggunakan library `maatwebsite/laravel-excel` untuk Excel dan `barryvdh/laravel-dompdf` untuk PDF.

---

### MR-06 — Daftar Kode Kondisi Odontogram Belum Didefinisikan

**Severity:** HIGH

**Temuan:**  
`backend.md` Bagian 5.12 menyebutkan contoh kondisi (`healthy`, `caries`, `filled`, dll.) namun "*daftar lengkap perlu disusun bersama dokter*". `frontend.md` Bagian 6.7 juga mengkonfirmasi hal ini. Tanpa daftar final, komponen odontogram frontend tidak dapat dirancang dan kolom `condition_code` tidak dapat divalidasi.

**Rekomendasi:**  
Ini adalah blocker untuk Tahap 3 (Rekam Medis). Sesi kerja bersama dokter klinik harus dijadwalkan sebelum Tahap 3 dimulai.

**Usulan Solusi:**  
Susun tabel `odontogram_conditions` sebagai master data dengan kolom `code`, `display_name`, `symbol`, `color` untuk mendukung rendering visual. Seeding awal berdasarkan standar notasi FDI yang umum digunakan.

---

### MR-07 — Mekanisme Diskon Belum Didefinisikan

**Severity:** MEDIUM

**Temuan:**  
`frontend.md` Bagian 8.6 dan `backend.md` Bagian 5.13 menyediakan kolom `discount_amount` namun mekanisme diskon (persentase vs nominal, per tindakan vs per transaksi) belum dikonfirmasi.

**Rekomendasi:**  
Minimal dukung diskon nominal per transaksi. Konfirmasi ke client apakah diskon persentase atau diskon per item tindakan diperlukan.

**Usulan Solusi:**  
Tambahkan kolom `discount_type` (`percentage` | `nominal`) dan `discount_value` (decimal) pada tabel `payments`. Kalkulasi `discount_amount` di backend berdasarkan type dan value.

---

### MR-08 — Fitur Cicilan/Pembayaran Bertahap

**Severity:** LOW

**Temuan:**  
`frontend.md` Bagian 11.4 poin 19 dan `backend.md` Bagian 12.1 poin 2 menyebutkan ini sebagai open question.

**Rekomendasi:**  
Cicilan tidak masuk scope tahap awal. Desain schema dengan mempertimbangkan extension di masa depan (lihat CR-01).

---

### MR-09 — Peruntukan Flutter Mobile App Tidak Didefinisikan

**Severity:** HIGH

**Temuan:**  
`backend.md` Bagian 1.1 dan 3.2 menyebutkan Flutter sebagai client namun "*peruntukan aplikasi mobile perlu dikonfirmasi ke client*". Ini mempengaruhi kebutuhan role/guard tambahan pada API (misalnya guard `patient` jika app diperuntukkan pasien).

**Rekomendasi:**  
Konfirmasi sebelum Tahap 1 development. Jika untuk pasien, diperlukan desain endpoint terpisah dan guard baru.

---

### MR-10 — Halaman Manajemen Akun Pribadi

**Severity:** MEDIUM

**Temuan:**  
`frontend.md` Bagian 7.2 menyebutkan "*perlu dikonfirmasi apakah dibutuhkan menu terpisah untuk pengaturan akun pribadi*" tanpa resolusi. Ubah password adalah kebutuhan dasar sistem.

**Rekomendasi:**  
Tambahkan halaman Profil Akun sebagai menu di header (bukan sidebar), dengan fitur ubah password dan lihat profil.

**Usulan Solusi:**  
Endpoint `PUT /api/v1/me/password` (request: `current_password`, `new_password`, `new_password_confirmation`). Frontend: dropdown menu di avatar/nama pengguna pada header.

---

### MR-11 — Audit Log Perubahan Data Sensitif

**Severity:** MEDIUM

**Temuan:**  
`backend.md` Bagian 12.3 poin 8 menanyakan kebutuhan audit log namun tidak mendapat jawaban. Data medis dan keuangan biasanya memerlukan audit trail untuk kepatuhan regulasi.

**Rekomendasi:**  
Implementasikan audit log minimal untuk tabel `medical_records` dan `payments`. Gunakan package seperti `spatie/laravel-activitylog`.

---

### MBR-01 — Aturan Pembatalan Appointment Tidak Didefinisikan

**Severity:** MEDIUM

**Temuan:**  
Status `cancelled` dan `no_show` ada pada enum `appointments.status`, namun tidak ada aturan bisnis yang mendefinisikan: siapa yang bisa membatalkan, dalam jangka waktu berapa sebelum jadwal, dan apakah ada notifikasi kepada pasien.

**Rekomendasi:**  
Definisikan: Admin dapat membatalkan appointment kapan saja; setelah jam appointment lewat tanpa check-in otomatis menjadi `no_show`.

---

### MBR-02 — Tarif Tindakan Per Cabang vs Global

**Severity:** HIGH

**Temuan:**  
`backend.md` Bagian 5.16 mempersiapkan kolom `branch_id` nullable pada `treatment_masters` untuk mendukung tarif per cabang, namun keputusan bisnis ini belum dikonfirmasi (`frontend.md` Bagian 11.4 poin 18).

**Rekomendasi:**  
Konfirmasi sebelum seed data master tindakan. Struktur schema sudah siap, hanya perlu keputusan bisnis.

**Usulan Solusi:**  
Jika tarif per cabang: satu item tindakan dapat memiliki banyak baris di `treatment_masters` dengan `branch_id` berbeda. Lookup saat input rekam medis difilter berdasarkan `branch_id` aktif.

---

### MBR-03 — Definisi "Pasien Baru" vs "Pasien Lama" Lintas Cabang

**Severity:** MEDIUM

**Temuan:**  
`backend.md` Bagian 10.4 mendefinisikan "pasien baru" berdasarkan `patients.created_at` dalam periode laporan. Namun pasien yang pindah dari cabang lain bisa dihitung sebagai "pasien baru" di cabang tersebut padahal sudah terdaftar di sistem.

**Rekomendasi:**  
Definisikan "pasien baru per cabang" berdasarkan kunjungan pertama (`medical_records`) di cabang tersebut, bukan tanggal pendaftaran global.

---

### MUP-01 — Role Super Admin Tidak Terdefinisi

**Severity:** HIGH

**Temuan:**  
`frontend.md` Bagian 3.4 dan `backend.md` Bagian 4.3 keduanya menyebutkan kemungkinan role "Super Admin" yang mengelola master data pusat, namun tidak ada definisi formal role ini.

**Rekomendasi:**  
Konfirmasi ke client. Jika owner ingin mendelegasikan pengelolaan master data ke satu admin terpusat, role Super Admin diperlukan dengan permission berbeda dari Admin cabang.

---

### MUP-02 — Akses Admin ke Data Pasien Lintas Cabang

**Severity:** HIGH

**Temuan:**  
`backend.md` Bagian 4.1 mengajukan pertanyaan: "*apakah Admin dapat melihat data pasien dari cabang lain saat pasien tersebut datang ke cabangnya?*" tanpa jawaban. Ini adalah skenario bisnis nyata yang perlu diputuskan.

**Rekomendasi:**  
Admin harus dapat **mencari** pasien secara global (karena pasien bisa datang dari cabang mana pun), namun **mencatat kunjungan baru** hanya di cabangnya sendiri.

**Usulan Solusi:**  
Endpoint `GET /api/v1/patients` bersifat global search (branch scope dinonaktifkan untuk pencarian). Endpoint `POST /api/v1/appointments` dan `POST /api/v1/payments` tetap scoped ke cabang Admin.

---

### MDE-01 — Tabel `patient_guardians`

**Severity:** MEDIUM

**Temuan:**  
Jika field wali/orang tua untuk pasien anak dikonfirmasi (lihat MR-03), tabel atau kolom tambahan diperlukan namun tidak ada dalam desain database `backend.md`.

**Rekomendasi:**  
Tambahkan kolom `guardian_name`, `guardian_phone`, `guardian_relation` langsung pada tabel `patients` (nullable) untuk kesederhanaan, atau buat tabel terpisah jika wali dapat lebih dari satu.

---

### MDE-02 — Entitas Alergi dan Riwayat Medis Pasien

**Severity:** HIGH

**Temuan:**  
Tidak ada tabel atau kolom untuk menyimpan alergi obat dan kondisi sistemik pasien pada desain database `backend.md`. Informasi ini kritis untuk keselamatan pasien.

**Rekomendasi:**  
Tambahkan kolom atau tabel sebelum schema final divalidasi.

**Usulan Solusi:**  
Opsi A (sederhana): Tambahkan kolom `drug_allergies` (text, nullable) dan `systemic_conditions` (text, nullable) pada tabel `patients`.  
Opsi B (terstruktur): Buat tabel `patient_medical_histories` dengan kolom `type` (enum: `allergy`, `systemic_condition`), `description`, dan `patient_id`.

---

### MDE-03 — Tabel `audit_logs`

**Severity:** MEDIUM

**Temuan:**  
Tidak ada rancangan tabel audit log pada `backend.md` meskipun disebutkan sebagai kebutuhan yang perlu dikonfirmasi.

**Rekomendasi:**  
Tambahkan tabel `activity_logs` (dapat menggunakan package `spatie/laravel-activitylog`) yang mencatat actor, action, model, dan perubahan data.

---

### MFP-01 — Halaman Profil Akun / Ubah Password

**Severity:** MEDIUM  
**Usulan Solusi:** Halaman `/account/profile` dengan form ubah password. Dapat diakses dari dropdown avatar di header.

---

### MFP-02 — Halaman 403 Unauthorized

**Severity:** MEDIUM  
**Usulan Solusi:** Halaman `/403` dengan pesan "Anda tidak memiliki izin untuk mengakses halaman ini" dan tombol kembali ke Dashboard.

---

### MFP-03 — Halaman 404 Not Found

**Severity:** LOW  
**Usulan Solusi:** Halaman catch-all dengan pesan dan navigasi kembali.

---

### MFP-04 — Halaman Reset Password

**Severity:** HIGH  
**Usulan Solusi:** Dua halaman: `/forgot-password` (input email) dan `/reset-password?token=...` (input password baru). Diperlukan jika fitur MR-01 dikonfirmasi.

---

### MFP-05 — Halaman Master Data Dokter (Form Detail)

**Severity:** MEDIUM  
**Temuan:** Sitemap `frontend.md` Bagian 7 menyebutkan "Data Dokter" pada Master Data, namun tidak ada wireframe spesifik untuk form tambah/edit dokter beserta jadwal praktik per cabang.  
**Usulan Solusi:** Tambahkan halaman form dokter ke wireframe spec dengan field: nama, SIP, spesialisasi, cabang penugasan, jadwal praktik per cabang (melalui tabel pivot `doctor_branch`).

---

## Prioritas Tindak Lanjut

### Harus diselesaikan sebelum development dimulai (Blocker)
1. **CR-01** — Tentukan relasi payment ↔ medical_record (cicilan atau tidak).
2. **AR-02** — Konfirmasi pendekatan odontogram (historis sudah diputuskan di backend, update frontend).
3. **AR-03** — Konfirmasi kebijakan edit rekam medis lama.
4. **MR-01** — Definisikan alur reset password.
5. **MR-06** — Finalisasi daftar kondisi odontogram bersama dokter.
6. **MUP-01** — Konfirmasi role Super Admin.
7. **MUP-02** — Tentukan akses Admin ke pasien lintas cabang.
8. **MDE-02** — Tambahkan field alergi dan riwayat medis ke schema.
9. **MR-09** — Konfirmasi peruntukan Flutter mobile app.

### Harus diselesaikan sebelum Tahap 3 (Medical Records)
10. **AR-03** — Kebijakan edit rekam medis (jika belum selesai dari poin 3).
11. **MBR-02** — Konfirmasi tarif tindakan per cabang atau global.
12. **MR-06** — Daftar kondisi odontogram (blocker Tahap 3).

### Dapat diselesaikan secara paralel dengan development
13. **MR-05** — Ekspor laporan.
14. **MR-07** — Mekanisme diskon.
15. **MR-10** — Halaman profil akun.
16. **MR-11** — Audit log.
17. **AR-05** — Pendekatan generate PDF.

---

*Dokumen ini harus diulas dan diperbarui setelah setiap sesi konfirmasi dengan client. Temuan yang sudah diresolusi harus diberi status "RESOLVED" beserta keputusan akhirnya.*
