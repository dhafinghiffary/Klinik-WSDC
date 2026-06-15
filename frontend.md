# Frontend Development Guide — Widya Santi Dental Care (WSDC)

**Versi Dokumen:** 1.0
**Tanggal:** 15 Juni 2026
**Audience:** Frontend Developer, System Analyst, Client Relation
**Status:** Draft untuk review client

**Tech Stack Frontend:**
- **Web:** React + TypeScript + Shadcn UI
- **Backend API:** Laravel 12 + Sanctum (lihat `backend.md` untuk detail teknis backend)
- **Konsumsi Data:** REST API berbasis JSON, autentikasi menggunakan Bearer Token (Sanctum)
- **File/Media:** foto pasien dan lampiran rekam medis diakses melalui URL yang disediakan API (Cloudflare R2 / Local Storage, lihat `backend.md` Bagian 9)

> Dokumen ini saling terhubung dengan `backend.md`. Struktur data, daftar field, dan alur autentikasi pada dokumen ini mengacu pada rancangan database dan API yang dijelaskan secara teknis di `backend.md`.

---

## 1. Project Overview

### 1.1 Latar Belakang

Widya Santi Dental Care (WSDC) adalah klinik gigi yang saat ini mengoperasikan **3 cabang**. Seluruh proses operasional klinik masih dijalankan secara manual, dengan kondisi sebagai berikut:

- Data pasien dicatat di buku register fisik dan sebagian direkap ulang ke Excel.
- Rekam medis pasien (anamnesa, diagnosa, tindakan, resep, odontogram) masih ditulis tangan di atas kertas.
- Kwitansi pembayaran dibuat dan dicatat secara manual menggunakan buku kwitansi.
- Pasien umumnya datang langsung ke klinik (walk-in) atau menghubungi klinik melalui WhatsApp untuk membuat perjanjian atau bertanya.
- Tidak ada sistem terpusat yang menghubungkan data antar cabang, sehingga riwayat pasien yang berpindah cabang sulit diakses.

Kondisi ini menimbulkan beberapa kendala: data pasien mudah hilang atau rusak, sulit melakukan rekap laporan keuangan multi-cabang, rekam medis sulit ditelusuri kembali saat pasien datang untuk perawatan lanjutan, dan proses administrasi memakan waktu lama baik bagi staf maupun pasien.

### 1.2 Tujuan Sistem

Sistem manajemen klinik WSDC dikembangkan untuk:

1. Mendigitalisasi seluruh proses pencatatan data pasien, rekam medis, appointment, dan pembayaran.
2. Menyediakan satu basis data terpusat yang dapat diakses oleh ketiga cabang, sehingga riwayat pasien tetap dapat diakses di cabang mana pun.
3. Mempercepat proses registrasi, pemeriksaan, dan pembayaran pasien.
4. Menyediakan laporan operasional dan keuangan secara real-time bagi Owner dan Admin.
5. Menjadi dasar untuk integrasi lanjutan dengan WhatsApp untuk notifikasi appointment di masa depan (tidak termasuk dalam scope tahap awal, namun perlu dipertimbangkan dalam desain struktur data).

### 1.3 Ruang Lingkup Dokumen

Dokumen ini menjadi acuan kerja untuk pengembangan **sisi frontend** sistem WSDC, mencakup struktur menu, alur pengguna, kebutuhan komponen UI, standar desain, serta roadmap pengerjaan. Dokumen ini tidak membahas detail implementasi backend, namun struktur data yang dijelaskan menjadi acuan bersama agar frontend dan backend selaras.

---

## 2. Business Process

### 2.1 Penjelasan Alur Bisnis Saat Ini

Proses pelayanan pasien di WSDC saat ini berjalan sebagai berikut:

1. **Kedatangan Pasien** — Pasien datang langsung ke klinik (walk-in) atau menghubungi klinik via WhatsApp untuk bertanya jadwal atau membuat perjanjian.
2. **Registrasi** — Petugas admin mencatat data pasien (jika pasien baru) atau mencari data pasien lama di buku register/Excel. Pasien diarahkan untuk menunggu sesuai antrian atau jadwal dokter.
3. **Menunggu** — Pasien menunggu di ruang tunggu sesuai urutan kedatangan atau jadwal appointment.
4. **Pemeriksaan Dokter** — Dokter memeriksa pasien, melakukan anamnesa (wawancara keluhan), menentukan diagnosa, dan melakukan tindakan medis yang diperlukan.
5. **Rekam Medis** — Dokter mencatat hasil anamnesa, diagnosa, tindakan, resep obat (jika ada), serta kondisi gigi pasien (odontogram) secara manual di kertas rekam medis.
6. **Pembayaran** — Setelah pemeriksaan selesai, pasien menuju kasir untuk melakukan pembayaran. Admin membuat kwitansi manual berdasarkan tindakan yang dilakukan.
7. **Pulang** — Pasien menerima kwitansi dan/atau resep, kemudian pulang.

### 2.2 Flow Sederhana

```
Pasien Datang / Chat WhatsApp
        ↓
   Registrasi
        ↓
    Menunggu
        ↓
 Pemeriksaan Dokter
        ↓
   Rekam Medis
        ↓
   Pembayaran
        ↓
      Pulang
```

### 2.3 Target Alur Setelah Sistem Diterapkan

Dengan adanya sistem, setiap tahapan di atas akan didukung oleh modul digital:

| Tahapan | Dukungan Sistem |
|---|---|
| Pasien datang / chat WA | Modul Appointment (booking), Modul Pasien (pencarian data pasien lama) |
| Registrasi | Modul Pasien (tambah/edit pasien), pencatatan kedatangan |
| Menunggu | Daftar kunjungan / antrian harian |
| Pemeriksaan dokter | Akses riwayat pasien, form rekam medis digital |
| Rekam medis | Modul Rekam Medis (anamnesa, diagnosa, tindakan, resep, foto, odontogram) |
| Pembayaran | Modul Pembayaran (input pembayaran, cetak kwitansi digital) |
| Pulang | Cetak kwitansi & resep dari sistem |

Catatan untuk System Analyst: alur di atas perlu dikonfirmasi ulang ke pihak klinik apakah ada proses tambahan yang belum tercatat, misalnya proses follow-up pasien pasca tindakan, klaim asuransi, atau proses pembelian obat di apotek internal klinik (jika ada).

---

## 3. User Roles

Sistem WSDC memiliki tiga role utama: **Admin**, **Dokter**, dan **Owner**. Setiap role memiliki tujuan, tugas harian, dan hak akses yang berbeda terhadap sistem.

### 3.1 Admin

**Tujuan Role:**
Admin bertugas sebagai garda depan operasional klinik — menangani registrasi pasien, pengelolaan jadwal, serta proses pembayaran di setiap cabang.

**Tugas Harian:**
- Mendaftarkan pasien baru dan memperbarui data pasien lama.
- Mencari data pasien saat pasien datang.
- Mengelola jadwal kunjungan/appointment pasien.
- Mencatat kedatangan pasien (check-in) dan mengatur antrian.
- Memproses pembayaran dan mencetak kwitansi.
- Melihat riwayat pembayaran pasien.

**Hak Akses:**
- Akses penuh ke Modul Pasien (tambah, edit, lihat detail, riwayat, pencarian).
- Akses penuh ke Modul Appointment (booking, jadwal, daftar kunjungan).
- Akses ke Modul Pembayaran (input pembayaran, riwayat, cetak kwitansi).
- Akses **lihat saja** (read-only) ke Modul Rekam Medis, terbatas pada riwayat tindakan untuk keperluan administrasi (perlu dikonfirmasi ke client apakah admin boleh melihat detail rekam medis atau hanya ringkasan tindakan untuk billing).
- Tidak memiliki akses ke Modul Laporan keuangan tingkat klinik secara keseluruhan (perlu dikonfirmasi apakah admin cabang boleh melihat laporan cabangnya sendiri).
- Tidak memiliki akses ke Master Data tingkat sistem (misalnya pengaturan tarif tindakan, daftar dokter, dll.) — kecuali jika ditentukan lain oleh client.

### 3.2 Dokter

**Tujuan Role:**
Dokter bertugas melakukan pemeriksaan dan mencatat hasil pemeriksaan pasien secara digital melalui modul rekam medis.

**Tugas Harian:**
- Melihat daftar pasien yang dijadwalkan/menunggu pada hari tersebut.
- Membuka data dan riwayat rekam medis pasien sebelum melakukan pemeriksaan.
- Mengisi rekam medis baru: anamnesa, diagnosa, tindakan yang dilakukan, resep obat, foto kondisi gigi/mulut, dan odontogram.
- Melihat riwayat tindakan pasien pada kunjungan-kunjungan sebelumnya.

**Hak Akses:**
- Akses **lihat saja** ke Modul Pasien (detail dan riwayat pasien) — dokter tidak menambah/mengedit data identitas pasien.
- Akses penuh ke Modul Rekam Medis untuk pasien yang ditanganinya (tambah dan edit rekam medis baru; perlu dikonfirmasi apakah dokter dapat mengedit rekam medis lama atau hanya menambahkan catatan baru).
- Akses ke Modul Appointment terbatas pada **jadwal dokter miliknya sendiri** (lihat jadwal praktik, daftar kunjungan harian).
- Tidak memiliki akses ke Modul Pembayaran.
- Tidak memiliki akses ke Modul Laporan, kecuali laporan ringkasan tindakan pribadinya (opsional, perlu dikonfirmasi).

### 3.3 Owner

**Tujuan Role:**
Owner adalah pemilik klinik yang membutuhkan visibilitas penuh terhadap kinerja operasional dan keuangan seluruh cabang untuk pengambilan keputusan bisnis.

**Tugas Harian:**
- Memantau laporan pendapatan harian, bulanan, dan tahunan dari seluruh cabang.
- Membandingkan performa antar cabang dan antar dokter.
- Memantau jumlah pasien baru dan pasien lama sebagai indikator pertumbuhan klinik.
- Sewaktu-waktu meninjau data pasien atau rekam medis untuk keperluan audit (opsional, perlu dikonfirmasi tingkat kedalaman akses).

**Hak Akses:**
- Akses penuh ke seluruh Modul Laporan (pendapatan harian/bulanan/tahunan, pasien baru/lama, pendapatan per dokter, pendapatan per cabang).
- Akses **lihat saja** ke Modul Pasien, Modul Appointment, Modul Rekam Medis, dan Modul Pembayaran di seluruh cabang (untuk keperluan monitoring, bukan operasional harian).
- Akses ke Master Data (pengaturan cabang, dokter, tarif tindakan, dan pengguna sistem) — perlu dikonfirmasi apakah Owner mengelola Master Data sendiri atau didelegasikan ke Admin tertentu (Super Admin).
- Dapat memilih/filter cabang untuk melihat data spesifik per cabang atau gabungan seluruh cabang.

### 3.4 Catatan untuk System Analyst

- Perlu dikonfirmasi apakah ada role tambahan seperti **Resepsionis** terpisah dari Admin, **Perawat/Asisten Dokter**, atau **Super Admin** pusat yang mengelola seluruh cabang.
- Perlu dikonfirmasi mekanisme **pembatasan akses per cabang** — apakah Admin dan Dokter hanya bisa melihat data cabang tempat mereka bertugas, atau bisa mengakses lintas cabang.
- Perlu dikonfirmasi apakah satu Dokter dapat bertugas di lebih dari satu cabang.

---

## 4. Functional Requirements

Daftar fitur berikut menjadi acuan pengembangan modul-modul frontend. Setiap fitur akan diturunkan menjadi halaman, form, atau komponen pada tahap wireframe dan development.

### 4.1 Modul Pasien

| Fitur | Deskripsi |
|---|---|
| Tambah Pasien | Form pendaftaran pasien baru dengan data identitas lengkap (lihat Bagian 5). |
| Edit Pasien | Form untuk memperbarui data identitas pasien yang sudah terdaftar. |
| Detail Pasien | Halaman yang menampilkan profil lengkap pasien beserta ringkasan riwayat kunjungan. |
| Riwayat Pasien | Daftar seluruh kunjungan, rekam medis, dan pembayaran pasien secara kronologis. |
| Pencarian Pasien | Fitur pencarian berdasarkan nama, nomor rekam medis, NIK, atau nomor HP. |

### 4.2 Modul Appointment

| Fitur | Deskripsi |
|---|---|
| Booking Pasien | Form untuk membuat jadwal appointment baru — pilih pasien (baru/lama), dokter, cabang, tanggal, dan jam. |
| Jadwal Dokter | Tampilan kalender/jadwal praktik masing-masing dokter per cabang. |
| Daftar Kunjungan | Daftar pasien yang terjadwal atau check-in pada hari tertentu, termasuk status (menunggu, sedang diperiksa, selesai). |

### 4.3 Modul Rekam Medis

| Fitur | Deskripsi |
|---|---|
| Anamnesa | Form pencatatan keluhan, riwayat penyakit, dan keterangan yang disampaikan pasien. |
| Diagnosa | Form pencatatan hasil diagnosa dokter berdasarkan anamnesa dan pemeriksaan. |
| Tindakan | Pencatatan tindakan medis yang dilakukan (misalnya tambal gigi, scaling, cabut gigi), termasuk gigi yang ditangani. |
| Resep | Pencatatan resep obat yang diberikan kepada pasien. |
| Foto Pasien | Upload dan penyimpanan foto kondisi gigi/mulut pasien sebagai dokumentasi medis. |
| Odontogram | Diagram visual interaktif kondisi gigi pasien (32 gigi dewasa / gigi susu) untuk menandai kondisi tiap gigi. |

### 4.4 Modul Pembayaran

| Fitur | Deskripsi |
|---|---|
| Pembayaran | Form input pembayaran berdasarkan tindakan yang dilakukan, termasuk metode pembayaran (tunai, kartu, transfer, dll — perlu dikonfirmasi). |
| Riwayat Pembayaran | Daftar transaksi pembayaran yang sudah dilakukan, dapat difilter berdasarkan tanggal, pasien, atau cabang. |
| Cetak Kwitansi | Fitur untuk mencetak atau mengunduh kwitansi pembayaran dalam format yang dapat dicetak (PDF). |

### 4.5 Modul Laporan

| Fitur | Deskripsi |
|---|---|
| Pendapatan Harian | Ringkasan total pendapatan per hari, dapat difilter per cabang. |
| Pendapatan Bulanan | Ringkasan total pendapatan per bulan, dapat difilter per cabang. |
| Pendapatan Tahunan | Ringkasan total pendapatan per tahun, dapat difilter per cabang. |
| Pasien Baru | Statistik jumlah pasien baru dalam periode tertentu. |
| Pasien Lama | Statistik jumlah kunjungan pasien lama (pasien yang sudah pernah terdaftar) dalam periode tertentu. |
| Pendapatan per Dokter | Ringkasan kontribusi pendapatan berdasarkan dokter yang menangani. |
| Pendapatan per Cabang | Ringkasan dan perbandingan pendapatan antar cabang. |

### 4.6 Catatan Tambahan

- Perlu dikonfirmasi apakah laporan dapat diekspor ke Excel/PDF.
- Perlu dikonfirmasi rentang waktu kustom (custom date range) untuk seluruh laporan.
- Perlu dikonfirmasi apakah dibutuhkan notifikasi (reminder appointment via WhatsApp/email) pada tahap awal atau tahap lanjutan.

---

## 5. Patient Data Structure

Berikut adalah field data pasien yang dibutuhkan pada Modul Pasien. Struktur ini menjadi acuan untuk form Tambah/Edit Pasien serta tampilan Detail Pasien.

| Field | Tipe Data | Wajib? | Keterangan |
|---|---|---|---|
| Nomor Rekam Medis | String (auto-generated) | Ya | Nomor unik yang dibuat otomatis oleh sistem saat pasien pertama kali terdaftar. Format perlu dikonfirmasi (misal: cabang + tahun + nomor urut). |
| Nama | String | Ya | Nama lengkap pasien. |
| NIK | String (16 digit) | Ya/Opsional* | Nomor Induk Kependudukan. *Perlu dikonfirmasi apakah wajib — beberapa pasien (anak-anak, WNA) mungkin belum memiliki NIK. |
| Tempat Lahir | String | Ya | Kota/kabupaten tempat lahir. |
| Tanggal Lahir | Date | Ya | Digunakan juga untuk menghitung usia pasien secara otomatis. |
| Jenis Kelamin | Enum (Laki-laki/Perempuan) | Ya | Pilihan dropdown/radio. |
| Alamat | Text | Ya | Alamat domisili pasien. |
| Nomor HP | String | Ya | Nomor kontak utama, digunakan juga untuk komunikasi via WhatsApp. |
| Pekerjaan | String | Opsional | Pekerjaan pasien. |

### 5.1 Catatan untuk System Analyst

- Perlu dikonfirmasi apakah dibutuhkan field tambahan seperti: nama orang tua/wali (untuk pasien anak), golongan darah, riwayat alergi obat, riwayat penyakit sistemik (diabetes, hipertensi, dll.), email, atau foto profil pasien.
- **Sudah diputuskan pada `backend.md` Bagian 2.1 & 5.6:** pasien terdaftar secara **global** (satu database untuk seluruh cabang), dengan field tambahan `home_branch_id` yang menyimpan cabang pendaftaran awal pasien. Frontend tidak perlu menampilkan input pemilihan cabang sebagai bagian dari identitas pasien yang dapat berubah, namun dapat menampilkan "Cabang Pendaftaran" sebagai informasi read-only pada Detail Pasien.
- Perlu dikonfirmasi format penomoran rekam medis yang berlaku saat ini di buku register, agar transisi data lama ke sistem baru lebih mudah (migrasi data). Frontend tidak perlu menyediakan input manual untuk Nomor Rekam Medis — field ini **digenerate otomatis oleh backend** (lihat `backend.md` Bagian 5.6) dan ditampilkan sebagai read-only setelah pasien tersimpan.

---

## 6. Medical Record Structure

Struktur rekam medis berikut disusun berdasarkan kebutuhan hasil wawancara dengan pihak klinik dan praktik umum pencatatan rekam medis gigi.

### 6.1 Anamnesa

Bagian ini mencatat informasi yang disampaikan pasien sebelum pemeriksaan, meliputi:

- Keluhan utama (chief complaint) — alasan kedatangan pasien.
- Riwayat keluhan — sejak kapan, frekuensi, tingkat keparahan.
- Riwayat penyakit umum yang relevan (misalnya diabetes, hipertensi, alergi obat) — *perlu dikonfirmasi apakah dicatat di sini atau di profil pasien sebagai data permanen*.
- Riwayat perawatan gigi sebelumnya (jika disampaikan pasien).

### 6.2 Diagnosa

Bagian ini mencatat hasil analisis dokter, meliputi:

- Diagnosa utama (nama kondisi/penyakit gigi yang ditemukan).
- Gigi yang terdampak (mengacu pada penomoran gigi pada odontogram).
- Catatan tambahan dari dokter (jika ada).

*Perlu dikonfirmasi apakah klinik menggunakan kode diagnosa standar (misalnya ICD-10) atau menggunakan istilah bebas.*

### 6.3 Tindakan

Bagian ini mencatat tindakan medis yang dilakukan pada kunjungan tersebut, meliputi:

- Nama tindakan (misalnya: tambal gigi, scaling, pencabutan, perawatan saluran akar).
- Gigi yang ditangani.
- Dokter yang melakukan tindakan.
- Tarif/biaya tindakan (untuk keperluan integrasi dengan Modul Pembayaran).
- Catatan tindakan (kondisi setelah tindakan, instruksi pasca-tindakan).

*Tindakan idealnya dapat dipilih dari daftar Master Data Tindakan, agar tarif otomatis terisi dan konsisten antar cabang — perlu dikonfirmasi apakah tarif tindakan sama di semua cabang atau berbeda per cabang.*

### 6.4 Resep

Bagian ini mencatat resep obat yang diberikan, meliputi:

- Nama obat.
- Dosis dan frekuensi penggunaan (misalnya 3x1 sehari).
- Jumlah obat yang diberikan.
- Catatan tambahan (misalnya: diminum setelah makan).

*Resep mendukung multi-item per kunjungan (tabel `prescriptions` pada `backend.md` Bagian 5.11) — form rekam medis pada frontend harus mendukung penambahan beberapa baris obat secara dinamis. Integrasi dengan stok obat klinik (apotek internal) belum termasuk dalam scope tahap awal — perlu dikonfirmasi jika dibutuhkan.*

### 6.5 Foto

Bagian ini menyimpan dokumentasi visual kondisi pasien, meliputi:

- Foto kondisi gigi/mulut sebelum tindakan.
- Foto kondisi setelah tindakan (opsional).
- Foto hasil rontgen (jika tersedia — *perlu dikonfirmasi apakah klinik memiliki alat rontgen digital*).

Setiap foto sebaiknya disertai tanggal pengambilan dan keterangan singkat, serta terhubung dengan kunjungan/rekam medis terkait. Secara teknis, foto diunggah melalui endpoint upload dan disimpan pada Cloudflare R2 (production) atau Local Storage (development); frontend menampilkan foto melalui URL yang dikembalikan API — lihat `backend.md` Bagian 9 untuk detail penyimpanan dan keamanan akses file.

### 6.6 Odontogram

Odontogram adalah diagram visual yang merepresentasikan kondisi seluruh gigi pasien. Struktur yang dibutuhkan:

- Representasi visual 32 gigi dewasa (notasi FDI atau Universal — *perlu dikonfirmasi notasi yang digunakan klinik*), atau gigi susu untuk pasien anak.
- Setiap gigi dapat ditandai dengan kondisi tertentu menggunakan simbol/warna standar, misalnya: gigi sehat, karies, tambalan, gigi hilang, gigi yang akan dicabut, gigi dengan perawatan saluran akar, dll.
- Odontogram bersifat **historis** — setiap kunjungan dapat memiliki odontogram tersendiri untuk melihat perkembangan kondisi gigi pasien dari waktu ke waktu, atau odontogram terkini yang terus diperbarui (*perlu dikonfirmasi pendekatan mana yang diinginkan klinik*).

### 6.7 Catatan untuk System Analyst

- Perlu disusun **daftar simbol odontogram standar** bersama dokter klinik sebelum tahap desain UI agar komponen odontogram dapat dirancang dengan tepat.
- Perlu dikonfirmasi apakah satu kunjungan dapat memiliki lebih dari satu diagnosa dan tindakan (multi-diagnosa/multi-tindakan dalam satu rekam medis).
- Perlu dikonfirmasi retensi data foto (berapa lama foto disimpan, batas ukuran file, format yang didukung).

---

## 7. Frontend Sitemap

Struktur menu utama sistem WSDC adalah sebagai berikut. Tampilan menu pada sidebar/navigasi dapat menyesuaikan dengan hak akses masing-masing role (lihat Bagian 3).

```
WSDC System
│
├── Dashboard
│   ├── Ringkasan harian (jumlah pasien, appointment, pendapatan hari ini)
│   └── Notifikasi/aktivitas terbaru
│
├── Pasien
│   ├── Daftar Pasien
│   ├── Tambah Pasien
│   ├── Detail Pasien
│   └── Riwayat Pasien
│
├── Appointment
│   ├── Booking Pasien
│   ├── Jadwal Dokter (kalender)
│   └── Daftar Kunjungan Hari Ini
│
├── Rekam Medis
│   ├── Form Rekam Medis Baru
│   │   ├── Anamnesa
│   │   ├── Diagnosa
│   │   ├── Tindakan
│   │   ├── Resep
│   │   ├── Upload Foto
│   │   └── Odontogram
│   └── Riwayat Rekam Medis (per pasien)
│
├── Pembayaran
│   ├── Input Pembayaran
│   ├── Riwayat Pembayaran
│   └── Cetak Kwitansi
│
├── Laporan
│   ├── Pendapatan Harian
│   ├── Pendapatan Bulanan
│   ├── Pendapatan Tahunan
│   ├── Pasien Baru vs Pasien Lama
│   ├── Pendapatan per Dokter
│   └── Pendapatan per Cabang
│
└── Master Data
    ├── Data Cabang
    ├── Data Dokter
    ├── Data Tindakan & Tarif
    ├── Data Obat (jika diperlukan)
    └── Manajemen Pengguna (Admin/Dokter/Owner)
```

### 7.1 Penjelasan Submenu

**Dashboard** — Halaman utama setelah login. Menampilkan ringkasan singkat (jumlah pasien hari ini, jumlah appointment, pendapatan hari ini) yang disesuaikan dengan role pengguna. Owner melihat ringkasan seluruh cabang, Admin/Dokter melihat ringkasan cabang/jadwalnya sendiri.

**Pasien** — Modul untuk mengelola data identitas dan riwayat pasien. Daftar Pasien menampilkan tabel seluruh pasien terdaftar dengan fitur pencarian dan filter. Tambah Pasien dan Detail Pasien sesuai Bagian 5. Riwayat Pasien menampilkan kronologi kunjungan, rekam medis, dan pembayaran pasien tersebut.

**Appointment** — Modul untuk mengelola jadwal kunjungan. Booking Pasien untuk membuat jadwal baru. Jadwal Dokter menampilkan kalender ketersediaan dokter per cabang. Daftar Kunjungan Hari Ini menampilkan antrian pasien beserta status (menunggu/diperiksa/selesai).

**Rekam Medis** — Modul inti untuk dokter. Form Rekam Medis Baru berisi seluruh komponen sesuai Bagian 6 (anamnesa, diagnosa, tindakan, resep, foto, odontogram) dalam satu alur pengisian. Riwayat Rekam Medis menampilkan seluruh rekam medis pasien dari kunjungan-kunjungan sebelumnya, dapat dibuka kembali untuk referensi dokter.

**Pembayaran** — Modul untuk admin memproses transaksi. Input Pembayaran terhubung dengan tindakan yang telah dicatat di Rekam Medis. Riwayat Pembayaran menampilkan daftar transaksi yang dapat difilter. Cetak Kwitansi menghasilkan dokumen kwitansi siap cetak/unduh.

**Laporan** — Modul khusus untuk Owner (dan opsional Admin sesuai cabang). Setiap submenu menampilkan data dalam bentuk tabel dan/atau grafik, dengan filter periode dan cabang.

**Master Data** — Modul administratif untuk mengelola data acuan sistem: daftar cabang, daftar dokter beserta jadwal praktiknya, daftar tindakan beserta tarif, daftar obat (jika dibutuhkan), serta manajemen akun pengguna sistem.

### 7.2 Catatan untuk System Analyst

- Perlu dikonfirmasi apakah Master Data sepenuhnya dikelola Owner/Super Admin, atau ada sebagian yang dapat dikelola Admin cabang (misalnya jadwal dokter harian).
- Perlu dikonfirmasi apakah dibutuhkan menu terpisah untuk pengaturan akun pribadi (profil, ubah password).

---

## 8. Wireframe Planning

Bagian ini menjelaskan halaman-halaman utama yang perlu dirancang pada tahap wireframe, beserta komponen yang dibutuhkan pada masing-masing halaman.

### 8.1 Halaman Login

**Tujuan:** Autentikasi pengguna sesuai role (Admin, Dokter, Owner).

**Komponen yang dibutuhkan:**
- Logo dan nama klinik (WSDC).
- Form input: username/email dan password.
- Tombol "Masuk" (submit).
- Link "Lupa Password" (opsional, perlu dikonfirmasi mekanismenya).
- Pesan error untuk validasi gagal login.
- Pemilihan cabang saat login (opsional — *perlu dikonfirmasi apakah satu akun terikat pada satu cabang atau dapat memilih cabang setelah login*).

### 8.2 Halaman Dashboard

**Tujuan:** Memberikan ringkasan informasi penting sesuai role pengguna saat pertama masuk ke sistem.

**Komponen yang dibutuhkan:**
- Header dengan informasi pengguna yang login dan cabang aktif.
- Kartu statistik (statistic cards): jumlah pasien hari ini, jumlah appointment hari ini, pendapatan hari ini, dll. — disesuaikan per role.
- Grafik ringkas (misalnya grafik tren pendapatan 7 hari terakhir) — khusus Owner/Admin.
- Daftar kunjungan/aktivitas terbaru dalam bentuk tabel ringkas.
- Navigasi cepat (quick action) ke modul yang sering digunakan.

### 8.3 Halaman Daftar Pasien

**Tujuan:** Menampilkan seluruh data pasien terdaftar dan menjadi titik akses untuk pencarian, penambahan, dan navigasi ke detail pasien.

**Komponen yang dibutuhkan:**
- Search bar untuk pencarian pasien (nama, nomor RM, NIK, nomor HP).
- Filter tambahan (misalnya filter cabang, jenis kelamin, rentang usia — opsional).
- Tabel data pasien dengan kolom: Nomor RM, Nama, Tanggal Lahir/Usia, Nomor HP, Cabang terdaftar, dan aksi (lihat detail, edit).
- Pagination untuk navigasi data dalam jumlah besar.
- Tombol "Tambah Pasien Baru" yang mengarah ke form Tambah Pasien.

### 8.4 Halaman Detail Pasien

**Tujuan:** Menampilkan profil lengkap pasien beserta ringkasan riwayat kunjungan, rekam medis, dan pembayaran.

**Komponen yang dibutuhkan:**
- Card profil pasien: nama, nomor RM, NIK, tanggal lahir/usia, jenis kelamin, alamat, nomor HP, pekerjaan.
- Tombol "Edit Data Pasien".
- Tab atau section navigasi: Riwayat Kunjungan, Riwayat Rekam Medis, Riwayat Pembayaran.
- Tabel/daftar riwayat kunjungan dengan tanggal, dokter yang menangani, dan ringkasan tindakan.
- Tombol untuk membuka rekam medis detail dari setiap kunjungan.
- Tombol "Buat Appointment Baru" untuk pasien tersebut (opsional, mempercepat alur admin).

### 8.5 Halaman Form Rekam Medis

**Tujuan:** Tempat dokter mengisi seluruh data pemeriksaan pasien pada satu kunjungan.

**Komponen yang dibutuhkan:**
- Header informasi pasien (nama, nomor RM, usia, ringkas) agar dokter dapat memverifikasi identitas pasien.
- Section Anamnesa: text area untuk keluhan dan riwayat.
- Section Diagnosa: text area atau dropdown diagnosa (jika menggunakan daftar standar), dengan pilihan gigi terkait.
- Section Tindakan: tabel/list tindakan yang dapat ditambahkan (multi-row), masing-masing dengan nama tindakan, gigi terkait, dan tarif.
- Section Resep: tabel/list obat (multi-row) dengan nama obat, dosis, jumlah, dan catatan.
- Section Upload Foto: komponen upload gambar dengan preview, mendukung multi-file.
- Section Odontogram: komponen visual interaktif yang menampilkan diagram gigi dan memungkinkan dokter menandai kondisi tiap gigi.
- Tombol "Simpan Rekam Medis" dan opsi "Simpan & Lanjut ke Pembayaran" (untuk mempercepat alur ke admin).

### 8.6 Halaman Form Pembayaran

**Tujuan:** Tempat admin memproses pembayaran berdasarkan tindakan yang telah dicatat dokter.

**Komponen yang dibutuhkan:**
- Header informasi pasien dan ringkasan kunjungan (dokter, tanggal, cabang).
- Tabel rincian tindakan beserta biaya masing-masing (diambil otomatis dari rekam medis).
- Total biaya keseluruhan.
- Input metode pembayaran. **Mengacu pada `backend.md` Bagian 2.3 & 5.13, metode yang didukung pada tahap awal adalah Tunai (Cash) dan Transfer** (enum `payment_method` pada tabel `payments`); metode lain seperti kartu debit/kredit atau QRIS dapat ditambahkan pada tahap lanjutan.
- Input jumlah dibayar dan kalkulasi kembalian (jika tunai).
- Input diskon (opsional, jika klinik memberikan diskon — *perlu dikonfirmasi mekanisme diskon, struktur kolom `discount_amount` sudah disiapkan pada `backend.md` Bagian 5.13*).
- Tombol "Proses Pembayaran".
- Setelah berhasil, tombol "Cetak Kwitansi" / "Unduh PDF" — *pendekatan generate PDF (di backend atau di frontend) masih perlu disepakati, lihat `backend.md` Bagian 12.1 poin 3*.

### 8.7 Halaman Dashboard Laporan

**Tujuan:** Menyediakan visualisasi data laporan untuk Owner (dan Admin sesuai hak akses).

**Komponen yang dibutuhkan:**
- Filter periode (harian, bulanan, tahunan, atau rentang kustom).
- Filter cabang (semua cabang atau cabang tertentu).
- Kartu statistik ringkasan (total pendapatan, jumlah pasien baru, jumlah kunjungan).
- Grafik tren pendapatan (line/bar chart) berdasarkan periode yang dipilih.
- Grafik perbandingan pendapatan per cabang.
- Grafik perbandingan pendapatan per dokter.
- Tabel rincian data yang dapat diekspor (opsional, *perlu dikonfirmasi format ekspor*).

### 8.8 Catatan Umum Wireframe

- Seluruh halaman perlu mempertimbangkan **state kosong** (empty state) — misalnya pasien belum memiliki riwayat, belum ada appointment hari ini, dll.
- Seluruh halaman dengan tabel perlu mempertimbangkan **state loading** dan **error state**.
- Wireframe sebaiknya dibuat dalam dua varian: desktop (untuk penggunaan di komputer admin/kasir) dan tablet (untuk kemungkinan penggunaan dokter dengan tablet saat memeriksa pasien) — *perlu dikonfirmasi perangkat yang akan digunakan di klinik*.

---

## 9. UI/UX Guidelines

Sistem WSDC dibangun menggunakan **React**, **TypeScript**, dan **Shadcn UI**. Bagian ini menjelaskan standar desain yang harus diikuti oleh Frontend Developer agar konsistensi antarmuka terjaga di seluruh modul.

### 9.1 Design System

- **Komponen UI** mengacu pada pustaka Shadcn UI sebagai basis komponen (button, input, select, dialog, table, card, dll.), dengan kustomisasi warna dan tipografi sesuai identitas visual WSDC.
- **Palet warna** sebaiknya menggunakan warna yang memberi kesan bersih dan profesional, umum digunakan pada aplikasi kesehatan (misalnya dominasi putih/abu muda dengan aksen biru atau hijau toska) — *warna final perlu dikonfirmasi dengan client, idealnya mengacu pada brand klinik jika sudah ada logo/warna resmi*.
- **Tipografi** menggunakan satu jenis font sans-serif yang mudah dibaca, dengan hierarki ukuran yang konsisten untuk judul halaman, sub-judul, label form, dan teks isi.
- **Ikon** menggunakan satu pustaka ikon konsisten (misalnya Lucide, yang umum digunakan bersama Shadcn UI) untuk navigasi dan aksi.
- **Spacing dan grid** menggunakan satuan konsisten (misalnya skala 4px/8px) agar tampilan rapi di seluruh halaman.

### 9.1a Integrasi dengan Backend API

- Seluruh data pada frontend diperoleh dari REST API Laravel 12 (`/api/v1/...`) sesuai endpoint yang dirancang pada `backend.md` Bagian 7.
- Autentikasi menggunakan **Laravel Sanctum (Bearer Token)** — setelah login berhasil (`POST /api/v1/login`), token disimpan secara aman pada sisi client dan disertakan pada header `Authorization` untuk setiap request berikutnya. Lihat `backend.md` Bagian 8 untuk alur lengkap.
- Menu sidebar dan hak akses ditampilkan secara dinamis berdasarkan `role` dan `branch_id` yang dikembalikan oleh endpoint `GET /api/v1/me` setelah login, sesuai matriks permission pada Bagian 3 dokumen ini dan `backend.md` Bagian 4.
- Setiap form wajib menampilkan pesan error per field berdasarkan response validasi Form Request Laravel (format error terstruktur), bukan pesan error generik.
- Komponen tabel data (Daftar Pasien, Riwayat Pembayaran, dll.) mengikuti format pagination standar dari API (`meta.pagination`) sesuai `backend.md` Bagian 7.8.

### 9.2 Layout

- **Struktur layout utama** terdiri dari: sidebar navigasi (kiri), header atas (informasi pengguna, cabang aktif, notifikasi), dan area konten utama.
- Sidebar menampilkan menu sesuai Sitemap (Bagian 7), dengan penyesuaian item menu berdasarkan role pengguna yang login.
- Header menampilkan nama pengguna yang login, role, cabang aktif (dengan opsi ganti cabang jika hak akses memungkinkan), dan tombol logout.
- Area konten menggunakan container dengan lebar maksimum yang konsisten dan padding yang seragam di seluruh halaman.

### 9.3 Form Standard

- Setiap form menggunakan label yang jelas di atas setiap input field.
- Field wajib diberi tanda (misalnya tanda bintang) dan validasi dilakukan sebelum submit, dengan pesan error yang jelas di bawah field terkait.
- Form dengan banyak section (misalnya Form Rekam Medis) dibagi menjadi beberapa card/section dengan judul section yang jelas, agar pengguna dapat memahami progres pengisian.
- Tombol aksi utama (Simpan/Submit) ditempatkan konsisten, biasanya di pojok kanan bawah form atau pada area sticky footer untuk form yang panjang.
- Tombol aksi sekunder (Batal/Kembali) ditempatkan di sebelah tombol utama dengan gaya visual yang lebih ringan (outline/ghost button).
- Form input tanggal menggunakan komponen date picker standar Shadcn UI.
- Form dengan input berulang (misalnya daftar tindakan, daftar obat pada rekam medis) menggunakan pola "dynamic row" — pengguna dapat menambah/menghapus baris input.

### 9.4 Table Standard

- Tabel menggunakan komponen table dari Shadcn UI dengan header kolom yang jelas dan rata kiri untuk teks, rata kanan untuk angka/nominal.
- Setiap tabel data utama (pasien, appointment, pembayaran, dll.) menyediakan: search bar, filter (jika relevan), pagination, dan kolom aksi (lihat/edit/hapus sesuai hak akses).
- Baris tabel dapat diklik untuk membuka detail (misalnya klik baris pasien membuka Detail Pasien), dengan kolom aksi terpisah untuk aksi spesifik (edit, hapus).
- Tabel menampilkan state kosong dengan pesan informatif (misalnya "Belum ada data pasien") dan state loading dengan skeleton/placeholder.

### 9.5 Modal Standard

- Modal/dialog digunakan untuk aksi singkat yang tidak memerlukan perpindahan halaman penuh, misalnya konfirmasi hapus data, form tambah cepat (quick add), atau preview foto/dokumen.
- Setiap modal memiliki judul yang jelas, tombol tutup (ikon "x") di pojok kanan atas, dan tombol aksi (konfirmasi/batal) di bagian bawah.
- Modal konfirmasi (misalnya hapus data) menggunakan komponen alert dialog dengan teks peringatan yang jelas mengenai konsekuensi aksi.
- Modal tidak digunakan untuk form yang kompleks dan panjang (seperti Form Rekam Medis) — form kompleks menggunakan halaman penuh.

### 9.6 Responsive Behavior

- Halaman administratif (Daftar Pasien, Pembayaran, Laporan) dioptimalkan untuk penggunaan **desktop/laptop**, karena umumnya digunakan oleh admin di meja resepsionis/kasir.
- Halaman Form Rekam Medis dan Odontogram dioptimalkan agar tetap dapat digunakan pada **tablet**, mengingat kemungkinan dokter menggunakan tablet saat memeriksa pasien — *perlu dikonfirmasi dengan client perangkat yang akan digunakan*.
- Sidebar navigasi dapat di-collapse menjadi ikon saja pada layar yang lebih kecil, dan berubah menjadi menu drawer pada perangkat mobile (jika diperlukan akses mobile — *perlu dikonfirmasi prioritasnya*).
- Tabel pada layar kecil menyesuaikan dengan horizontal scroll atau mode tampilan card per baris data (perlu disepakati pendekatan mana yang dipilih).

---

## 10. Frontend Development Roadmap

Roadmap berikut disusun secara bertahap berdasarkan urutan prioritas yang telah ditentukan, dimulai dari fondasi sistem (autentikasi) hingga modul pelaporan.

### Tahap 1 — Authentication
- Halaman Login.
- Mekanisme penyimpanan sesi pengguna (token/session) dan proteksi halaman berdasarkan role.
- Halaman Dashboard kosong/kerangka sebagai landing page setelah login, dengan navigasi sidebar dasar sesuai role.
- Penanganan logout dan halaman akses ditolak (unauthorized) untuk role yang tidak memiliki izin.

### Tahap 2 — Pasien
- Halaman Daftar Pasien (tabel, pencarian, pagination).
- Form Tambah Pasien dan Edit Pasien sesuai struktur data Bagian 5.
- Halaman Detail Pasien dengan informasi profil dan kerangka tab riwayat (riwayat kunjungan/rekam medis/pembayaran dapat ditampilkan sebagai placeholder sebelum modul terkait selesai).

### Tahap 3 — Rekam Medis
- Halaman Form Rekam Medis dengan seluruh section: Anamnesa, Diagnosa, Tindakan, Resep, Upload Foto.
- Komponen Odontogram interaktif (dikembangkan secara bertahap — versi awal dapat berupa diagram statis dengan kemampuan klik per gigi, kemudian disempurnakan).
- Halaman Riwayat Rekam Medis pada Detail Pasien (menampilkan data rekam medis yang sudah tersimpan).
- Integrasi Modul Appointment dasar (Daftar Kunjungan Hari Ini) sebagai pintu masuk dokter ke Form Rekam Medis — *Modul Appointment penuh (Booking, Jadwal Dokter) dapat disusun pada tahap ini atau disesuaikan urutannya bersama System Analyst, karena tidak disebutkan dalam prioritas utama namun dibutuhkan sebagai pendukung alur*.

### Tahap 4 — Pembayaran
- Halaman Form Pembayaran yang mengambil data tindakan dari Rekam Medis.
- Halaman Riwayat Pembayaran dengan filter dan pencarian.
- Fitur Cetak Kwitansi (generate PDF/print view).

### Tahap 5 — Laporan
- Halaman Dashboard Laporan dengan filter periode dan cabang.
- Implementasi seluruh sub-laporan: Pendapatan Harian, Bulanan, Tahunan, Pasien Baru/Lama, Pendapatan per Dokter, Pendapatan per Cabang.
- Visualisasi data menggunakan grafik (chart library yang kompatibel dengan stack React/TypeScript yang dipilih).

### Catatan Roadmap

- **Modul Appointment** dan **Master Data** kini telah dipetakan secara eksplisit pada `backend.md` Bagian 11 (Tahap 2 — Master Data, dan Tahap 4 — Appointments, sebelum Tahap 5 — Medical Records). Disarankan frontend mengikuti urutan yang sama: Master Data dasar (daftar dokter, cabang, tarif tindakan) dikembangkan bersamaan dengan Tahap 2 (Pasien) sebagai data pendukung form, dan Modul Appointment (Booking, Jadwal Dokter, Daftar Kunjungan) dikembangkan **sebelum** Tahap 3 (Rekam Medis) agar tersedia "Daftar Kunjungan Hari Ini" sebagai pintu masuk dokter ke Form Rekam Medis.
- Setiap tahap sebaiknya diakhiri dengan sesi review bersama Client Relation untuk memastikan hasil sesuai ekspektasi sebelum berlanjut ke tahap berikutnya.
- Setiap tahap frontend bergantung pada ketersediaan endpoint API terkait pada `backend.md` Bagian 11 — koordinasi rilis API antara Backend Developer dan Frontend Developer perlu dijadwalkan agar kedua tim dapat bekerja paralel tanpa saling menunggu.

---

## 11. Risks and Open Questions

Daftar berikut merupakan hal-hal yang perlu dikonfirmasi kepada client sebelum atau selama proses development, untuk mengurangi risiko perubahan besar di tengah pengerjaan.

### 11.1 Terkait Role dan Akses
1. Apakah ada role tambahan selain Admin, Dokter, dan Owner (misalnya Resepsionis, Perawat, Super Admin)?
2. Apakah akses pengguna dibatasi per cabang, atau pengguna tertentu dapat mengakses lintas cabang?
3. Apakah satu dokter dapat bertugas di lebih dari satu cabang?
4. Apakah Admin memiliki akses melihat detail rekam medis, atau hanya ringkasan tindakan untuk keperluan pembayaran?

### 11.2 Terkait Data Pasien
5. Apakah NIK wajib diisi untuk semua pasien (termasuk anak-anak dan WNA)?
6. Apakah dibutuhkan field tambahan pada data pasien, seperti riwayat alergi, golongan darah, riwayat penyakit sistemik, atau data orang tua/wali untuk pasien anak?
7. Apakah data pasien bersifat global (satu database untuk 3 cabang) atau terpisah per cabang?
8. Bagaimana format penomoran rekam medis yang berlaku saat ini, untuk keperluan migrasi data dari sistem manual?

### 11.3 Terkait Rekam Medis
9. Apakah klinik menggunakan kode diagnosa standar (misalnya ICD-10) atau istilah bebas yang ditentukan dokter?
10. Apakah satu kunjungan dapat memiliki lebih dari satu diagnosa dan tindakan dalam satu rekam medis?
11. Notasi odontogram apa yang digunakan klinik (FDI, Universal, atau lainnya), dan simbol/kondisi gigi apa saja yang perlu didukung?
12. Apakah odontogram bersifat historis per kunjungan, atau satu odontogram yang terus diperbarui (kondisi terkini)?
13. Apakah dokter dapat mengedit rekam medis yang sudah tersimpan dari kunjungan sebelumnya, atau hanya dapat menambah catatan baru?
14. Apakah dibutuhkan integrasi dengan alat rontgen digital untuk upload foto hasil rontgen?
15. Berapa lama retensi data foto pasien, dan apakah ada batasan ukuran/format file?

### 11.4 Terkait Pembayaran
16. Metode pembayaran apa yang perlu didukung sistem (tunai, transfer bank, kartu debit/kredit, QRIS, dll.)?
17. Apakah klinik memberikan diskon, dan jika ya, bagaimana mekanismenya (persentase, nominal, per tindakan)?
18. Apakah tarif tindakan sama di seluruh cabang atau berbeda per cabang?
19. Apakah dibutuhkan fitur cicilan/pembayaran bertahap untuk tindakan dengan biaya besar?

### 11.5 Terkait Appointment
20. Bagaimana mekanisme booking saat ini melalui WhatsApp — apakah perlu diintegrasikan langsung ke sistem (misalnya melalui WhatsApp API) pada tahap awal, atau cukup dicatat manual oleh admin ke sistem?
21. Apakah dibutuhkan reminder otomatis (notifikasi) kepada pasien sebelum jadwal appointment?

### 11.6 Terkait Laporan
22. Apakah laporan perlu mendukung ekspor ke Excel dan/atau PDF?
23. Apakah dibutuhkan rentang waktu kustom (custom date range) selain harian/bulanan/tahunan?

### 11.7 Terkait Perangkat dan Infrastruktur
24. Perangkat apa yang akan digunakan oleh masing-masing role (komputer desktop, laptop, atau tablet)? Hal ini mempengaruhi prioritas desain responsif, khususnya untuk Form Rekam Medis dan Odontogram.
25. Apakah dibutuhkan akses sistem melalui aplikasi mobile, atau cukup melalui browser di seluruh perangkat?
26. Apakah dibutuhkan mode kerja offline (misalnya jika koneksi internet di klinik tidak stabil)?

### 11.8 Risiko Umum Proyek
27. **Risiko migrasi data**: data pasien dan rekam medis lama tersimpan dalam format kertas/Excel yang tidak terstruktur, sehingga proses migrasi data ke sistem baru memerlukan effort tambahan dan perlu direncanakan terpisah dari pengembangan frontend.
28. **Risiko perubahan struktur data**: karena rekam medis dan odontogram bergantung pada hasil wawancara dengan dokter, perubahan struktur data setelah development berjalan dapat berdampak pada komponen UI yang sudah dibuat — disarankan finalisasi struktur rekam medis dan odontogram sebelum Tahap 3 dimulai.
29. **Risiko konsistensi multi-cabang**: perbedaan kebijakan operasional antar cabang (misalnya tarif, jam praktik) jika tidak distandarkan sejak awal dapat menambah kompleksitas Master Data dan filter laporan.

---

*Dokumen ini bersifat hidup (living document) dan akan diperbarui sesuai hasil diskusi lanjutan dengan client. Seluruh poin pada Bagian 11 (Risks and Open Questions) sebaiknya dikonfirmasi oleh Client Relation sebelum tahap development dimulai untuk masing-masing modul terkait. Dokumen ini saling terhubung dengan `backend.md` — perubahan pada struktur data, endpoint API, atau alur autentikasi pada `backend.md` perlu disinkronkan kembali ke dokumen ini.*
