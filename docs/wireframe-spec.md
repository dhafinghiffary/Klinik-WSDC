# Wireframe Specification — Widya Santi Dental Care (WSDC)

**Versi Dokumen:** 1.0  
**Tanggal:** 15 Juni 2026  
**Sumber:** `frontend.md` v1.0 + `api-contract.md` v1.0  
**Tech Stack:** React + TypeScript + Shadcn UI  
**Audience:** Frontend Developer  
**Status:** Draft

---

## Konvensi Dokumen

- **[R]** = Required field
- **[O]** = Optional field
- `[ADMIN]`, `[DOCTOR]`, `[OWNER]` = Komponen/aksi yang hanya tampil untuk role tersebut
- `API:` = Endpoint API yang dikonsumsi komponen tersebut
- `→` = Navigasi ke halaman lain

---

## Global Layout

Semua halaman setelah login menggunakan layout berikut:

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  [Logo WSDC]  [Nama Cabang Aktif ▼]    [Nama User | Role] [⏻] │
└────────────────────────┬────────────────────────────────────────┘
│  SIDEBAR               │  MAIN CONTENT AREA                    │
│  ─────────             │                                        │
│  📊 Dashboard          │                                        │
│  👤 Pasien             │                                        │
│  📅 Appointment        │                                        │
│  📋 Rekam Medis        │                                        │
│  💳 Pembayaran         │                                        │
│  📈 Laporan [OWNER]    │                                        │
│  ⚙️  Master Data [OWN] │                                        │
└────────────────────────┴────────────────────────────────────────┘
```

**Header:**
- Logo klinik (kiri).
- Dropdown cabang aktif (tengah kiri) — hanya tampil untuk Owner dan Dokter multi-cabang. Trigger `POST /api/v1/me/switch-branch`.
- Nama pengguna + role badge (kanan). Klik membuka dropdown: "Profil Akun", "Logout".
- Tombol logout memanggil `POST /api/v1/logout` lalu redirect ke `/login`.

**Sidebar:**
- Item menu disembunyikan sesuai role:
  - Admin: tidak melihat Laporan dan Master Data.
  - Dokter: tidak melihat Pembayaran, Laporan, Master Data.
  - Owner: melihat semua.
- Sidebar dapat di-collapse menjadi ikon saja (toggle button di pojok atas sidebar).
- Item aktif ditandai dengan background highlight.

**State loading global:** Skeleton loader pada area konten saat navigasi antar halaman.

---

## Halaman 1 — Login (`/login`)

### Tujuan
Autentikasi pengguna. Entry point sistem sebelum masuk ke halaman manapun.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│               [Logo WSDC]                                       │
│          Widya Santi Dental Care                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            MASUK KE SISTEM WSDC                         │   │
│  │                                                         │   │
│  │  Email *                                                │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ admin@wsdc.id                                    │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  Password *                                             │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ ••••••••••••                              [👁]   │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  [Lupa Password?]                                       │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │              MASUK                               │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ⚠ [Pesan error tampil di sini jika login gagal]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Komponen

| Komponen | Detail |
|---|---|
| Card login | Shadcn `Card`, lebar 400px, terpusat secara vertikal dan horizontal |
| Logo | Gambar logo + teks nama klinik |
| Input Email | Shadcn `Input`, type=email, placeholder "Masukkan email Anda" |
| Input Password | Shadcn `Input`, type=password, tombol toggle show/hide password |
| Tombol Masuk | Shadcn `Button` variant=default, full-width, loading state saat submit |
| Link Lupa Password | Teks kecil, navigasi ke `/forgot-password` |
| Alert error | Shadcn `Alert` variant=destructive, tampil setelah response 401/422 |

### Validasi (Client-side)
- Email: wajib, format email valid.
- Password: wajib, minimal 6 karakter.
- Error ditampilkan di bawah field terkait (format `p.text-destructive text-sm`).

### Flow
1. User mengisi email + password → klik Masuk.
2. Tombol berubah ke state loading (disabled + spinner).
3. Kirim `POST /api/v1/login`.
4. **Sukses (200):** Simpan token ke localStorage/httpOnly cookie → redirect ke `/dashboard`.
5. **Gagal (401):** Tampilkan Alert "Email atau password salah."
6. **Gagal (422):** Tampilkan error per field di bawah input terkait.

### State
- Default: form kosong.
- Loading: tombol disabled + spinner.
- Error: pesan di bawah field atau alert.

---

## Halaman 2 — Dashboard (`/dashboard`)

### Tujuan
Ringkasan harian dan navigasi cepat. Tampilan berbeda per role.

### Layout — Owner

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                          [Filter Cabang: Semua ▼]   │
│  ─────────────────────────────────────────────────────────────  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │Appointmt │  │ Pasien   │  │Pendapatan│  │ Selesai      │   │
│  │ Hari Ini │  │ Hari Ini │  │ Hari Ini │  │ Hari Ini     │   │
│  │   24     │  │   22     │  │ 7.5 juta │  │   18         │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                 │
│  Tren Pendapatan 7 Hari Terakhir                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Line Chart — pendapatan 7 hari]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Performa Cabang Hari Ini                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Cabang A  | 8 appt | Rp 2.5jt                         │   │
│  │  Cabang B  | 10 appt| Rp 3jt                           │   │
│  │  Cabang C  | 6 appt | Rp 2jt                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Layout — Admin

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard — WSDC Cabang A                                      │
│  ─────────────────────────────────────────────────────────────  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │Appointmt │  │Menunggu  │  │Selesai   │                      │
│  │ Hari Ini │  │          │  │          │                      │
│  │    8     │  │    3     │  │    5     │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                 │
│  Kunjungan Hari Ini                              [Lihat Semua]  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  09:00 | Andi Wijaya     | drg. Budi | ✅ Selesai       │   │
│  │  09:30 | Sari Dewi       | drg. Budi | 🔵 Diperiksa     │   │
│  │  10:00 | Bambang Susilo  | drg. Ayu  | ⏳ Menunggu      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Quick Actions                                                  │
│  [+ Pasien Baru]  [+ Appointment]  [Daftar Kunjungan Hari Ini] │
└─────────────────────────────────────────────────────────────────┘
```

### Layout — Dokter

```
┌─────────────────────────────────────────────────────────────────┐
│  Selamat pagi, drg. Budi Santoso                                │
│  Jadwal hari ini: 8 pasien                                      │
│  ─────────────────────────────────────────────────────────────  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │Menunggu  │  │Diperiksa │  │Selesai   │                      │
│  │    3     │  │    1     │  │    4     │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                 │
│  Antrian Saya                                    [Lihat Semua]  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. 09:00 | Andi Wijaya    | ⏳ Menunggu | [Mulai]      │   │
│  │  2. 09:30 | Sari Dewi      | 🔵 Diperiksa| [Rekam Medis]│  │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### API
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/appointments/today` (untuk tabel kunjungan)

### Komponen

| Komponen | Detail |
|---|---|
| Stat Cards | 3-4 Shadcn `Card` berjejer, masing-masing: label + angka besar + ikon |
| Line Chart | Library Recharts atau Chart.js — tren 7 hari, responsive |
| Tabel Kunjungan | Shadcn `Table`, maks. 5 baris, kolom: waktu, pasien, dokter, status badge |
| Status Badge | Shadcn `Badge` dengan warna: kuning (menunggu), biru (diperiksa), hijau (selesai), merah (cancel) |
| Quick Actions | Shadcn `Button` group — navigasi cepat ke fitur utama |

### State
- Loading: Skeleton card dan skeleton tabel.
- Empty: "Belum ada kunjungan hari ini."

---

## Halaman 3 — Daftar Pasien (`/patients`)

### Tujuan
Menampilkan seluruh pasien terdaftar dengan fitur pencarian, filter, dan akses ke detail.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Daftar Pasien                            [+ Tambah Pasien]    │
│  ─────────────────────────────────────────────────────────────  │
│  ┌──────────────────────────┐  [Filter: Semua Cabang ▼]  [🔍] │
│  │ 🔍 Cari nama, RM, NIK, HP│                                  │
│  └──────────────────────────┘                                   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ No. RM        │ Nama          │ Tgl Lahir │ No. HP  │ Aksi│ │
│  │───────────────│───────────────│───────────│─────────│─────│ │
│  │WSA-2026-000001│ Andi Wijaya   │20/05/1990 │0812xxxxx│[👁][✏]│
│  │WSA-2026-000002│ Sari Dewi     │15/08/1995 │0813xxxxx│[👁][✏]│
│  │WSA-2026-000003│ Bambang S.    │10/03/1980 │0814xxxxx│[👁][✏]│
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Menampilkan 1-15 dari 248 pasien    [< 1  2  3 ... 17 >]      │
└─────────────────────────────────────────────────────────────────┘
```

### Komponen

| Komponen | Detail |
|---|---|
| Search Bar | Shadcn `Input` dengan debounce 300ms — trigger `?search=` pada API |
| Filter Cabang | Shadcn `Select` — hanya tampil untuk Owner |
| Tombol Tambah | Shadcn `Button` variant=default — navigasi ke `/patients/create` — `[ADMIN]` saja |
| Tabel | Shadcn `Table` dengan kolom: No. RM, Nama, Tgl Lahir/Usia, No. HP, Cabang Daftar, Aksi |
| Baris tabel | Klik baris navigasi ke `/patients/{id}` |
| Ikon Lihat | Navigasi ke `/patients/{id}` |
| Ikon Edit | Navigasi ke `/patients/{id}/edit` — `[ADMIN]` saja |
| Pagination | Shadcn `Pagination` — `?page=` + `?per_page=` |

### API
- `GET /api/v1/patients?search=...&page=...&per_page=15&branch_id=...`

### State
- Loading: Skeleton rows pada tabel (5-7 baris skeleton).
- Empty (tidak ada hasil pencarian): "Tidak ada pasien ditemukan untuk pencarian ini."
- Empty (belum ada pasien): "Belum ada pasien terdaftar. Mulai dengan menambahkan pasien baru."

### Validasi Pencarian
- Minimum 2 karakter sebelum pencarian dikirim ke API.
- Loading indicator pada search bar saat request berlangsung.

---

## Halaman 4 — Detail Pasien (`/patients/{id}`)

### Tujuan
Menampilkan profil lengkap pasien dan riwayat kunjungan, rekam medis, pembayaran.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Daftar Pasien                                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [Avatar]  Andi Wijaya          No. RM: WSA-2026-000001   │  │
│  │           L, 36 Tahun          HP: 08123456789           │  │
│  │           Cabang Asal: WSDC Cabang A                     │  │
│  │           Alergi: Penisilin  ⚠                           │  │
│  │                               [✏ Edit Data] [+ Booking]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Riwayat Kunjungan] [Rekam Medis] [Pembayaran]                │
│  ─────────────────────────────────────────────────────────────  │
│  (Tab: Riwayat Kunjungan aktif)                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tanggal     │ Dokter         │ Tindakan       │ Status   │  │
│  │─────────────│────────────────│────────────────│──────────│  │
│  │ 10 Mei 2026 │ drg. Budi S.   │ Scaling, Tambal│ ✅ Lunas │  │
│  │ 20 Jan 2026 │ drg. Ayu P.    │ Konsultasi     │ ✅ Lunas │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Komponen

| Komponen | Detail |
|---|---|
| Card Profil | Nama besar, No. RM, gender + usia (dihitung dari birth_date), HP, alamat, pekerjaan, cabang asal |
| Alert Alergi | Shadcn `Alert` variant=warning — tampil jika `drug_allergies` tidak null |
| Tombol Edit | Navigasi ke `/patients/{id}/edit` — `[ADMIN]` saja |
| Tombol Booking | Navigasi ke `/appointments/create?patient_id={id}` — `[ADMIN]` saja |
| Tab | Shadcn `Tabs` — Riwayat Kunjungan, Rekam Medis, Pembayaran |

**Tab Riwayat Kunjungan:**
- Tabel: Tanggal, Dokter, Tindakan (ringkasan), Status Bayar.
- Klik baris → navigasi ke `/medical-records/{medical_record_id}`.
- `API: GET /api/v1/patients/{id}/history`

**Tab Rekam Medis:**
- Tabel: Tanggal, Dokter, Diagnosa, Jumlah Tindakan.
- Klik baris → navigasi ke `/medical-records/{id}`.
- `API: GET /api/v1/patients/{id}/medical-records` — `[DOCTOR, OWNER]`; Admin melihat versi ringkas.

**Tab Pembayaran:**
- Tabel: Tanggal, No. Kwitansi, Total, Metode, Status.
- Tombol "Cetak Kwitansi" di setiap baris → `GET /api/v1/payments/{id}/receipt`.
- `API: GET /api/v1/patients/{id}/payments` — `[ADMIN, OWNER]`

### State
- Loading: Skeleton card profil + skeleton tabel.
- Tab empty: "Belum ada riwayat kunjungan." / "Belum ada rekam medis." / "Belum ada riwayat pembayaran."

---

## Halaman 5 — Form Tambah / Edit Pasien (`/patients/create` dan `/patients/{id}/edit`)

### Tujuan
Menambahkan pasien baru atau mengedit data identitas pasien yang sudah ada.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Daftar Pasien / Detail Pasien                                │
│  Tambah Pasien Baru  (atau: Edit Data Pasien: Andi Wijaya)      │
│  ─────────────────────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DATA IDENTITAS                                          │  │
│  │                                                          │  │
│  │  Nama Lengkap *          NIK                             │  │
│  │  [___________________]   [________________]              │  │
│  │                                                          │  │
│  │  Tempat Lahir *          Tanggal Lahir *                 │  │
│  │  [___________________]   [📅 DD/MM/YYYY  ]              │  │
│  │                                                          │  │
│  │  Jenis Kelamin *         Nomor HP *                      │  │
│  │  ○ Laki-laki ○ Perempuan [___________________]           │  │
│  │                                                          │  │
│  │  Alamat *                                                │  │
│  │  [__________________________________________________]    │  │
│  │                                                          │  │
│  │  Pekerjaan                                               │  │
│  │  [___________________]                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DATA MEDIS (opsional)                                   │  │
│  │                                                          │  │
│  │  Alergi Obat                                             │  │
│  │  [__________________________________________________]    │  │
│  │                                                          │  │
│  │  Kondisi Sistemik (diabetes, hipertensi, dll.)           │  │
│  │  [__________________________________________________]    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DATA WALI (jika pasien berusia < 17 tahun)              │  │
│  │                                                          │  │
│  │  Nama Wali               Hubungan                        │  │
│  │  [___________________]   [___________________]           │  │
│  │                                                          │  │
│  │  No. HP Wali                                             │  │
│  │  [___________________]                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│                          [Batal]  [Simpan Pasien]               │
└─────────────────────────────────────────────────────────────────┘
```

### Form Fields

| Field | Komponen | Validasi |
|---|---|---|
| Nama Lengkap [R] | Input | required, max:200 |
| NIK [O] | Input | nullable, digits:16 |
| Tempat Lahir [R] | Input | required, max:100 |
| Tanggal Lahir [R] | DatePicker (Shadcn) | required, past date |
| Jenis Kelamin [R] | RadioGroup | required, male/female |
| Nomor HP [R] | Input | required, numeric-like, max:20 |
| Alamat [R] | Textarea | required |
| Pekerjaan [O] | Input | max:100 |
| Alergi Obat [O] | Textarea | — |
| Kondisi Sistemik [O] | Textarea | — |
| Nama Wali [O*] | Input | required if usia < 17 |
| Hubungan Wali [O*] | Input | max:50 |
| No. HP Wali [O*] | Input | — |

*Section Data Wali hanya tampil jika usia pasien (dihitung dari Tanggal Lahir) < 17 tahun.

### Tombol

| Tombol | Aksi |
|---|---|
| Batal | Kembali ke halaman sebelumnya tanpa menyimpan |
| Simpan Pasien | Submit form. Loading state saat request. |

### API
- Create: `POST /api/v1/patients`
- Edit: `PUT /api/v1/patients/{id}`
- Setelah sukses: redirect ke `/patients/{id}` dengan toast "Pasien berhasil disimpan."

### State
- Loading saat submit: tombol disabled + spinner.
- Error per field: teks merah di bawah field terkait.
- Edit mode: form pre-filled dengan data pasien dari `GET /api/v1/patients/{id}`.
- Mode create: field No. RM tidak ada (digenerate backend).

---

## Halaman 6 — Daftar Appointment / Kunjungan Hari Ini (`/appointments`)

### Tujuan
Menampilkan seluruh appointment dan daftar kunjungan harian. Pintu masuk utama operasional harian Admin dan Dokter.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Kunjungan & Appointment                     [+ Booking Baru]  │
│  ─────────────────────────────────────────────────────────────  │
│  Filter: [Tanggal: 16 Jun 2026 📅] [Dokter: Semua ▼] [Status ▼]│
│                                                                 │
│  HARI INI — 8 Kunjungan                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │Waktu │ Pasien          │ Dokter        │Status    │ Aksi │  │
│  │──────│─────────────────│───────────────│──────────│──────│  │
│  │09:00 │ Andi Wijaya     │ drg. Budi S.  │⏳Menunggu│[✓][👁]│  │
│  │09:30 │ Sari Dewi       │ drg. Budi S.  │🔵Diperiksa│  [👁]│ │
│  │10:00 │ Bambang Susilo  │ drg. Ayu P.   │✅Selesai │   [👁]│  │
│  │10:30 │ Dewi Rahayu     │ drg. Budi S.  │❌Batal   │   [👁]│  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Komponen

| Komponen | Detail |
|---|---|
| DatePicker | Default: hari ini. Mengubah tanggal reload tabel. |
| Filter Dokter | Shadcn `Select` — populate dari `GET /api/v1/doctors?branch_id=...` |
| Filter Status | Shadcn `Select` — enum status appointment |
| Tombol Booking | Navigasi ke `/appointments/create` — `[ADMIN]` saja |
| Tabel Kunjungan | Kolom: Waktu, Pasien (klik → `/patients/{id}`), Dokter, Status Badge, Aksi |
| Tombol Check-in (✓) | Muncul hanya untuk status `scheduled`. Klik → modal konfirmasi → `PATCH /api/v1/appointments/{id}/status` `{status: "checked_in"}` — `[ADMIN]` |
| Tombol Lihat Detail (👁) | Navigasi ke detail appointment / membuka slide panel detail |
| Tombol Mulai Rekam Medis | Muncul untuk Dokter pada baris dengan status `checked_in` → `/medical-records/create?appointment_id={id}` |

### API
- `GET /api/v1/appointments?date=YYYY-MM-DD&doctor_id=...&status=...`
- `PATCH /api/v1/appointments/{id}/status`

### Status Badge Colors
| Status | Warna Badge | Label |
|---|---|---|
| `scheduled` | Abu-abu | Terjadwal |
| `checked_in` | Kuning | Check-in |
| `in_progress` | Biru | Diperiksa |
| `completed` | Hijau | Selesai |
| `cancelled` | Merah | Dibatalkan |
| `no_show` | Oranye | Tidak Hadir |

### State
- Loading: Skeleton rows.
- Empty: "Tidak ada kunjungan untuk tanggal ini."

---

## Halaman 7 — Form Booking Appointment (`/appointments/create`)

### Tujuan
Admin membuat jadwal kunjungan pasien.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Kunjungan                                                    │
│  Booking Appointment Baru                                       │
│  ─────────────────────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PILIH PASIEN                                            │  │
│  │  Cari Pasien *                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ 🔍 Ketik nama / nomor RM / nomor HP                │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  [Hasil pencarian dropdown muncul di sini]               │  │
│  │  [Atau: + Pasien Baru]                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  JADWAL                                                  │  │
│  │                                                          │  │
│  │  Dokter *                    Cabang *                    │  │
│  │  [Pilih Dokter        ▼]    [WSDC Cabang A       ▼]     │  │
│  │                                                          │  │
│  │  Tanggal *                   Jam                         │  │
│  │  [📅 DD/MM/YYYY      ]      [⏰ HH:MM             ]     │  │
│  │                                                          │  │
│  │  Catatan                                                 │  │
│  │  [________________________________________________]      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│                          [Batal]  [Simpan Booking]              │
└─────────────────────────────────────────────────────────────────┘
```

### Form Fields

| Field | Komponen | Validasi |
|---|---|---|
| Pasien [R] | Combobox search async | required — cari via `GET /api/v1/patients?search=` |
| Dokter [R] | Select | required — populate dari `GET /api/v1/doctors?branch_id=` |
| Cabang [R] | Select | required — pre-fill dengan cabang Admin aktif (read-only untuk Admin) |
| Tanggal [R] | DatePicker | required, today or future |
| Jam [O] | TimePicker (Input type=time) | format HH:MM |
| Catatan [O] | Textarea | max:500 |

### Behavior
- Jika parameter `?patient_id=` ada di URL (dari halaman Detail Pasien), field Pasien pre-filled dan read-only.
- Dropdown dokter difilter berdasarkan cabang yang dipilih.
- Tombol "+ Pasien Baru" membuka modal create patient atau navigasi ke `/patients/create`.

### API
- `GET /api/v1/patients?search=...` (async search)
- `GET /api/v1/doctors?branch_id=...`
- `POST /api/v1/appointments`
- Sukses: redirect ke `/appointments` dengan toast konfirmasi.

---

## Halaman 8 — Form Rekam Medis (`/medical-records/create` dan `/medical-records/{id}/edit`)

### Tujuan
Dokter mengisi seluruh data pemeriksaan dalam satu kunjungan.

### Layout (multi-section, halaman panjang dengan sticky header)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Daftar Kunjungan                                [Simpan RM] │
│  Rekam Medis — Andi Wijaya (WSA-2026-000001)                   │
│  ─────────────────────────────────────────────────────────────  │
│  [⚠ ALERGI: Penisilin]                                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INFORMASI KUNJUNGAN                                     │  │
│  │  Pasien: Andi Wijaya | L, 36 Thn | HP: 08123456789      │  │
│  │  Dokter: drg. Budi Santoso | Cabang: WSDC Cabang A      │  │
│  │  Tanggal: 16 Juni 2026                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. ANAMNESA *                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Keluhan utama, riwayat keluhan, riwayat          │   │  │
│  │  │ perawatan gigi sebelumnya...                      │   │  │
│  │  │                                                   │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  2. DIAGNOSA                           [+ Tambah Diagnosa]│  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ No. Gigi │ Nama Diagnosa              │ Catatan │ 🗑 │ │  │
│  │  │ [46    ] │ [Karies Dentin           ] │ [    ] │ 🗑 │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  3. TINDAKAN *                        [+ Tambah Tindakan] │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ No. Gigi │ Nama Tindakan      │ Tarif    │Catatan│🗑 │ │  │
│  │  │ [46    ] │[Tambal Komposit  ▼]│[200,000] │[    ]│ 🗑│ │  │
│  │  │ [      ] │[Konsultasi       ▼]│[ 50,000] │[    ]│ 🗑│ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  4. RESEP                              [+ Tambah Obat]   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Nama Obat        │ Dosis  │ Frekuensi │ Jml │ 🗑│   │  │
│  │  │[Amoksisilin 500mg│[500mg] │[3x1      ]│[10 ]│ 🗑│   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  5. FOTO PASIEN                                          │  │
│  │  ┌────────────────────────────────┐                     │  │
│  │  │  📷 Klik atau seret foto       │  [Jenis: Klinis ▼] │  │
│  │  │  maks. 5MB, jpg/png/pdf        │  [Keterangan...   ]│  │
│  │  └────────────────────────────────┘                     │  │
│  │  [Preview thumbnails foto yang sudah diupload]           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  6. ODONTOGRAM                                           │  │
│  │  [Diagram 32 gigi dewasa — klik gigi untuk tandai kondisi│  │
│  │   dengan dropdown kondisi per gigi]                      │  │
│  │                    [Legenda Kondisi]                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Catatan Tambahan Dokter                                 │  │
│  │  [__________________________________________________]    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Batal]         [Simpan Rekam Medis]  [Simpan & ke Pembayaran]│
└─────────────────────────────────────────────────────────────────┘
```

### Komponen Detail

**Section Informasi Kunjungan:**
- Read-only card. Data dari appointment terpilih (`appointment_id` dari URL query param) atau input manual.
- Alert alergi obat ditampilkan jika `patient.drug_allergies` tidak null.

**Section Anamnesa:**
- Shadcn `Textarea`, min-height: 120px.
- Field wajib.

**Section Diagnosa:**
- Dynamic rows. Setiap baris: Input nomor gigi (FDI), Input nama diagnosa, Textarea catatan, Tombol hapus baris.
- Tombol "+ Tambah Diagnosa" menambah baris kosong baru.

**Section Tindakan:**
- Dynamic rows. Setiap baris: Input nomor gigi, Combobox tindakan (dari `GET /api/v1/treatment-masters`), Input tarif (auto-fill dari master, dapat diedit), Textarea catatan, Hapus.
- Wajib minimal 1 tindakan.
- Total tindakan ditampilkan di bawah tabel.

**Section Resep:**
- Dynamic rows. Setiap baris: Input nama obat, Input dosis, Input frekuensi, Input jumlah, Textarea catatan, Hapus.

**Section Foto:**
- Dropzone (react-dropzone atau Shadcn-compatible).
- Upload langsung ke `POST /api/v1/medical-records/{id}/photos` setelah rekam medis dibuat, atau dikumpulkan dan diupload setelah save.
- Preview thumbnail foto yang sudah diupload dengan tombol hapus per foto.

**Section Odontogram:**
- Komponen SVG interaktif: diagram 2 baris gigi (atas bawah), representasi FDI.
- Klik gigi → Popover/Dialog kecil muncul dengan Dropdown kondisi (dari `GET /api/v1/odontogram-conditions`) + textarea catatan.
- Gigi yang sudah ditandai menampilkan simbol/warna kondisi sesuai master.
- Tombol "Reset Odontogram" mengosongkan semua kondisi.
- Legenda kondisi tampil di bawah diagram.

### Tombol Aksi
| Tombol | Aksi |
|---|---|
| Batal | Kembali ke halaman sebelumnya, muncul modal konfirmasi "Data belum disimpan, yakin keluar?" |
| Simpan Rekam Medis | Submit → `POST /api/v1/medical-records` → redirect ke `/medical-records/{id}` |
| Simpan & ke Pembayaran | Submit → sukses → redirect ke `/payments/create?medical_record_id={id}` |

### API
- `GET /api/v1/appointments/{id}` — pre-fill info kunjungan
- `GET /api/v1/treatment-masters?branch_id=...` — dropdown tindakan
- `GET /api/v1/odontogram-conditions` — dropdown kondisi gigi
- `POST /api/v1/medical-records`
- `POST /api/v1/medical-records/{id}/photos`

### State
- Loading saat submit: tombol disabled + spinner.
- Auto-save draft (localStorage) untuk mencegah kehilangan data jika halaman tidak sengaja ditutup — opsional, implementasi di tahap lanjutan.

---

## Halaman 9 — Detail Rekam Medis (`/medical-records/{id}`)

### Tujuan
Menampilkan rekam medis kunjungan secara read-only. Dapat diakses dari Riwayat Pasien.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Riwayat Pasien                           [✏ Edit] [🖨 Cetak]│
│  Rekam Medis — 16 Juni 2026                                    │
│  Andi Wijaya (WSA-2026-000001) | drg. Budi Santoso | Cab. A   │
│  ─────────────────────────────────────────────────────────────  │
│  ANAMNESA                                                       │
│  Pasien mengeluh sakit gigi kanan bawah sejak 3 hari...        │
│                                                                 │
│  DIAGNOSA                                                       │
│  • Gigi 46: Karies Dentin                                      │
│                                                                 │
│  TINDAKAN                    Tarif                             │
│  • Tambal Gigi Komposit (46) Rp 200.000                        │
│  • Konsultasi                Rp  50.000                        │
│  ─────────────────────────────────────────────────────────────  │
│                              Total: Rp 250.000                 │
│                                                                 │
│  RESEP                                                          │
│  1. Amoksisilin 500mg — 3x1, 10 tablet (setelah makan)        │
│  2. Paracetamol 500mg — 3x1 jika nyeri, 10 tablet             │
│                                                                 │
│  FOTO PASIEN                                                    │
│  [thumbnail] [thumbnail] [thumbnail]                           │
│                                                                 │
│  ODONTOGRAM                                                     │
│  [Diagram gigi read-only dengan kondisi yang sudah ditandai]   │
│                                                                 │
│  CATATAN TAMBAHAN                                               │
│  Pasien diminta kontrol 1 minggu lagi.                         │
│                                                                 │
│  [Proses Pembayaran →] (jika belum ada payment)                │
└─────────────────────────────────────────────────────────────────┘
```

### Komponen
- Seluruh data ditampilkan read-only.
- Foto dapat diklik untuk preview full-size (Shadcn `Dialog` dengan gambar besar).
- Tombol "Edit" hanya tampil untuk Dokter yang membuat rekam medis ini — `[DOCTOR]`.
- Tombol "Proses Pembayaran" tampil jika `payment === null` — `[ADMIN]` — navigasi ke `/payments/create?medical_record_id={id}`.

### API
- `GET /api/v1/medical-records/{id}`

---

## Halaman 10 — Form Pembayaran (`/payments/create`)

### Tujuan
Admin memproses pembayaran berdasarkan tindakan dari rekam medis.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Rekam Medis                                                  │
│  Proses Pembayaran                                              │
│  ─────────────────────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INFORMASI KUNJUNGAN                                     │  │
│  │  Pasien: Andi Wijaya (WSA-2026-000001)                   │  │
│  │  Dokter: drg. Budi Santoso | Tgl: 16 Juni 2026          │  │
│  │  Cabang: WSDC Cabang A                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  RINCIAN TINDAKAN                                        │  │
│  │  ☑ Tambal Gigi Komposit (Gigi 46)      Rp 200.000       │  │
│  │  ☑ Konsultasi                           Rp  50.000       │  │
│  │  ─────────────────────────────────────────────────       │  │
│  │  Subtotal                               Rp 250.000       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PEMBAYARAN                                              │  │
│  │  Diskon:  [Nominal ▼]  [__________]  = Rp 0             │  │
│  │  Total yang Harus Dibayar:              Rp 250.000       │  │
│  │                                                          │  │
│  │  Metode Pembayaran *                                     │  │
│  │  ○ Tunai (Cash)   ○ Transfer Bank                       │  │
│  │                                                          │  │
│  │  (jika Tunai:)                                           │  │
│  │  Jumlah Dibayar:   [___________]                        │  │
│  │  Kembalian:         Rp 0                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Batal]                              [Proses Pembayaran]      │
└─────────────────────────────────────────────────────────────────┘
```

### Komponen

| Komponen | Detail |
|---|---|
| Card Info Kunjungan | Read-only dari data rekam medis |
| Checklist Tindakan | Seluruh tindakan dari rekam medis dengan checkbox (default semua tercentang) |
| Dropdown Diskon | Tipe: "Nominal" atau "Persentase" + Input nilai diskon |
| Total Dinamis | Kalkulasi real-time: subtotal - diskon = total |
| Radio Metode | Tunai / Transfer |
| Input Jumlah Dibayar | Hanya tampil jika metode = Tunai |
| Kalkulasi Kembalian | Real-time: jumlah dibayar - total |

### Validasi
- `paid_amount >= final_amount` jika status harus `paid` (tidak ada cicilan pada tahap awal).
- Jika `paid_amount < final_amount`: tampilkan peringatan "Pembayaran kurang dari total. Pembayaran akan dicatat sebagai Partial."

### API
- `GET /api/v1/medical-records/{id}` — ambil data kunjungan + tindakan
- `POST /api/v1/payments`
- Sukses: redirect ke halaman detail pembayaran + toast "Pembayaran berhasil diproses."
- Auto-tampilkan tombol "Cetak Kwitansi" setelah sukses.

---

## Halaman 11 — Riwayat Pembayaran (`/payments`)

### Tujuan
Menampilkan seluruh transaksi pembayaran dengan filter dan opsi cetak kwitansi.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Riwayat Pembayaran                                             │
│  ─────────────────────────────────────────────────────────────  │
│  [Dari: 📅] [s/d: 📅]  [Cabang: Semua ▼] [Metode: Semua ▼]   │
│  [🔍 Cari nama pasien / no. kwitansi]      [Terapkan]         │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ No. Kwitansi     │Pasien       │ Total     │Mtd  │Status│Aksi│
│  │──────────────────│─────────────│───────────│─────│──────│────│
│  │INV-WSA-202606-001│Andi Wijaya  │Rp 250.000 │Tunai│Lunas │[🖨][👁]│
│  │INV-WSA-202606-002│Sari Dewi    │Rp 150.000 │TF   │Lunas │[🖨][👁]│
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Total Pendapatan (periode terfilter): Rp 400.000              │
│  Menampilkan 1-15 dari 45 transaksi    [< 1  2  3 >]           │
└─────────────────────────────────────────────────────────────────┘
```

### Komponen

| Komponen | Detail |
|---|---|
| Date Range Picker | Dari - Sampai menggunakan Shadcn DatePicker |
| Filter Cabang | Hanya Owner; Admin auto-filter ke cabangnya |
| Filter Metode | Select: Semua / Tunai / Transfer |
| Search | Cari nama pasien atau nomor kwitansi |
| Tabel | Kolom: No. Kwitansi, Pasien, Total, Metode, Status Badge, Aksi |
| Tombol Cetak (🖨) | Trigger `GET /api/v1/payments/{id}/receipt` → download PDF |
| Tombol Lihat (👁) | Navigasi ke `/payments/{id}` |
| Summary | Total pendapatan periode terfilter (dari data halaman saat ini atau dari API) |

### API
- `GET /api/v1/payments?date_from=...&date_to=...&branch_id=...&payment_method=...&page=...`

### State
- Loading: Skeleton rows.
- Empty: "Tidak ada transaksi untuk periode yang dipilih."

---

## Halaman 12 — Laporan (`/reports`)

### Tujuan
Dashboard laporan untuk Owner. Visualisasi pendapatan dan statistik pasien.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Laporan & Analitik                                             │
│  ─────────────────────────────────────────────────────────────  │
│  [Periode: Bulan Ini ▼]  [Dari: 📅] [s/d: 📅]  [Cabang: Semua ▼]│
│                                              [Terapkan Filter] │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │Total     │  │Total     │  │Pasien    │  │Pasien        │   │
│  │Pendapatan│  │Transaksi │  │Baru      │  │Kunjungan     │   │
│  │Rp 45jt   │  │   120    │  │   35     │  │   85         │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                 │
│  Tren Pendapatan                         Pasien Baru vs Lama   │
│  ┌────────────────────────┐  ┌────────────────────────────┐   │
│  │ [Line/Bar Chart tren]  │  │ [Pie/Bar Chart baru vs lama│   │
│  └────────────────────────┘  └────────────────────────────┘   │
│                                                                 │
│  Pendapatan per Cabang          Pendapatan per Dokter          │
│  ┌────────────────────────┐  ┌────────────────────────────┐   │
│  │ [Bar Chart per cabang] │  │ [Bar/Table per dokter]     │   │
│  └────────────────────────┘  └────────────────────────────┘   │
│                                                                 │
│  Rincian Transaksi                          [Ekspor Excel] [PDF]│
│  [Tabel transaksi dengan pagination]                            │
└─────────────────────────────────────────────────────────────────┘
```

### Sub-Filter Periode
| Pilihan | Perilaku |
|---|---|
| Hari Ini | date = today |
| Minggu Ini | date_from = awal minggu, date_to = hari ini |
| Bulan Ini | month + year saat ini |
| Tahun Ini | year saat ini |
| Custom | Input manual date_from + date_to |

### Komponen

| Komponen | Detail |
|---|---|
| Stat Cards | 4 kartu: Total Pendapatan, Total Transaksi, Pasien Baru, Pasien Kunjungan |
| Line Chart Tren | Recharts LineChart — sumbu X: tanggal/bulan, sumbu Y: nominal |
| Pie/Bar Chart Pasien | Perbandingan pasien baru vs lama dalam periode |
| Bar Chart Cabang | Pendapatan per cabang (horizontal bar) |
| Bar/Table Dokter | Ranking dokter berdasarkan pendapatan |
| Tombol Ekspor | `GET /api/v1/reports/revenue/monthly?export=excel` atau `?export=pdf` — pending konfirmasi (gap-analysis MR-05) |

### API (multiple parallel calls saat filter diterapkan)
- `GET /api/v1/reports/revenue/monthly?month=...&year=...&branch_id=...`
- `GET /api/v1/reports/patients/new-vs-returning?date_from=...&date_to=...`
- `GET /api/v1/reports/revenue/by-branch?date_from=...&date_to=...`
- `GET /api/v1/reports/revenue/by-doctor?date_from=...&date_to=...`

### State
- Loading: Skeleton cards dan chart placeholder.
- Empty: "Tidak ada data untuk periode yang dipilih."

---

## Halaman 13 — Settings / Master Data (`/settings`)

### Tujuan
Manajemen data master sistem: cabang, dokter, tindakan, kondisi odontogram, pengguna.

### Layout (Tab-based)

```
┌─────────────────────────────────────────────────────────────────┐
│  Pengaturan & Master Data                                       │
│  ─────────────────────────────────────────────────────────────  │
│  [Cabang] [Dokter] [Tindakan & Tarif] [Odontogram] [Pengguna]  │
│  ─────────────────────────────────────────────────────────────  │
│  (Tab: Pengguna aktif)                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [+ Tambah Pengguna]         [🔍 Cari...]               │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Nama        │ Email          │ Role   │Cabang │Aksi│  │  │
│  │  │─────────────│────────────────│────────│───────│────│  │  │
│  │  │Siti Rahayu  │ siti@wsdc.id   │ Admin  │Cab. A │[✏][🗑]│ │
│  │  │drg. Budi S. │ budi@wsdc.id   │ Dokter │Cab. A │[✏][🗑]│ │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Tab: Cabang
- Tabel: Nama, Kode, Alamat, No. Telepon, Status, Aksi (Edit / Nonaktifkan).
- Tombol "+ Tambah Cabang".
- Form tambah/edit: modal atau halaman baru.
- `API: GET/POST/PUT /api/v1/branches`

### Tab: Dokter
- Tabel: Nama, SIP, Spesialisasi, Cabang Penugasan, Aksi.
- Tombol "+ Tambah Dokter".
- Form tambah/edit termasuk penugasan cabang dan jadwal praktik.
- `API: GET/POST/PUT /api/v1/doctors`

### Tab: Tindakan & Tarif
- Tabel: Nama Tindakan, Cabang (atau "Global"), Tarif, Status Aktif, Aksi.
- Tombol "+ Tambah Tindakan".
- Form: Input nama, tarif, pilihan cabang (atau global).
- `API: GET/POST/PUT /api/v1/treatment-masters`

### Tab: Odontogram
- Tabel: Kode, Nama Kondisi, Simbol, Warna (preview swatch), Status, Aksi.
- Tombol "+ Tambah Kondisi".
- Form: Input kode (otomatis), nama, simbol, color picker.
- `API: GET/POST/PUT /api/v1/odontogram-conditions`

### Tab: Pengguna
- Tabel: Nama, Email, Role Badge, Cabang, Status Aktif, Aksi.
- Tombol "+ Tambah Pengguna".
- Form: Input nama, email, password (baru), pilih role, pilih cabang.
- Edit: password opsional (kosongkan jika tidak diubah).
- Tombol Nonaktifkan (soft delete) — tidak ada tombol hapus permanen.
- `API: GET/POST/PUT /api/v1/users`

### Modal Konfirmasi Nonaktifkan
- Judul: "Nonaktifkan Pengguna?"
- Teks: "Pengguna ini tidak akan dapat login setelah dinonaktifkan. Data yang sudah dibuat tidak akan terhapus."
- Tombol: "Batal" | "Ya, Nonaktifkan"

---

## Modal Standar — Referensi Komponen

### Modal Konfirmasi Aksi Destruktif

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠ Konfirmasi Nonaktifkan                               [✕]   │
│  ─────────────────────────────────────────────────────────────  │
│  Apakah Anda yakin ingin menonaktifkan pengguna ini?            │
│  Tindakan ini dapat dibatalkan dengan mengaktifkan kembali      │
│  pengguna melalui menu Pengaturan.                              │
│                                                                 │
│                          [Batal]  [Ya, Nonaktifkan]            │
└─────────────────────────────────────────────────────────────────┘
```

- Gunakan Shadcn `AlertDialog` untuk semua konfirmasi aksi destruktif.
- Tombol konfirmasi menggunakan variant=destructive (merah).

### Toast Notification
- Sukses: Shadcn `Toast` variant=default dengan ikon hijau.
- Error: Shadcn `Toast` variant=destructive.
- Posisi: kanan bawah layar.
- Durasi: 4 detik.

### Loading State
- Tombol aksi: disabled + spinner (Shadcn `Loader2` icon berputar).
- Tabel: Shadcn `Skeleton` rows.
- Card stat: Shadcn `Skeleton` block.
- Full page: centered spinner + teks "Memuat data...".

### Empty State
- Centered content: ikon ilustrasi (Lucide icon besar) + judul + deskripsi singkat + tombol aksi primer (jika ada).

---

## Halaman Error

### Halaman 403 — Akses Ditolak (`/403`)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              🔒                                                 │
│         Akses Ditolak                                          │
│  Anda tidak memiliki izin untuk mengakses halaman ini.         │
│                                                                 │
│           [← Kembali ke Dashboard]                             │
└─────────────────────────────────────────────────────────────────┘
```

### Halaman 404 — Tidak Ditemukan (`/404` / catch-all)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              🔍                                                 │
│         Halaman Tidak Ditemukan                                 │
│  Halaman yang Anda cari tidak ada atau telah dipindahkan.      │
│                                                                 │
│           [← Kembali ke Dashboard]                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Catatan Implementasi untuk Developer

### Routing
- Gunakan React Router v6 dengan route-level protection berdasarkan role.
- Protected routes: cek token + role dari `localStorage`/context sebelum render.
- Redirect otomatis ke `/login` jika tidak ada token.
- Redirect ke `/403` jika role tidak memiliki akses ke route tersebut.

### State Management
- Token dan data user (`id`, `role`, `branch`) disimpan di React Context (AuthContext).
- State API (loading, error, data) menggunakan React Query (TanStack Query) untuk caching dan refetching.

### Form Handling
- Gunakan React Hook Form + Zod untuk validasi client-side yang konsisten dengan aturan di API Contract.
- Error dari API (422) dimap ke field errors React Hook Form menggunakan `setError`.

### Tanggal dan Format
- Gunakan `date-fns` atau `dayjs` untuk manipulasi tanggal.
- Tampilkan tanggal dalam format Indonesia: "16 Juni 2026" atau "16/06/2026".
- Simpan dan kirim ke API dalam format ISO: "2026-06-16".
- Nominal uang: format `Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'})`.

### Aksesibilitas
- Setiap form input memiliki `aria-label` atau `htmlFor` yang terhubung ke `id` input.
- Tombol ikon (tanpa teks) memiliki `aria-label` deskriptif.
- Modal menggunakan `role="dialog"` dan `aria-labelledby`.

---

*Dokumen ini adalah spesifikasi lengkap untuk implementasi frontend. Setiap halaman dan komponen di atas sudah cukup detail untuk dapat diimplementasikan tanpa klarifikasi tambahan, kecuali poin-poin yang masih pending konfirmasi client (lihat gap-analysis.md). Perubahan pada api-contract.md harus disinkronkan ke dokumen ini.*
