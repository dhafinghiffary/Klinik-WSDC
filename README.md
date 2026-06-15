# Widya Santi Dental Care — Sistem Manajemen Klinik

Sistem manajemen klinik gigi untuk **3 cabang Widya Santi Dental Care (WSDC)**, menggantikan proses manual (buku registrasi, rekam medis tulisan tangan, kuitansi manual).

---

## Tim

| Anggota | Peran |
|---|---|
| dhafinghiffary | Frontend · System Analyst · Client Relation |
| SShineee | Backend · System Architect · Database |

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12, Laravel Sanctum (Bearer Token) |
| Database | PostgreSQL 15 |
| File Storage | Cloudflare R2 |
| Frontend | React 19, TypeScript, Shadcn UI, TanStack Query, Zod |
| Mobile | Flutter *(Phase 4+)* |

---

## Struktur Folder

```
Klinik-WSDC/
├── backend/          # Laravel 12 API — SShineee
├── frontend/         # React + TypeScript — dhafinghiffary
├── mobile/           # Flutter — TBD Phase 4
└── docs/             # Dokumentasi teknis lengkap
```

---

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [docs/gap-analysis.md](docs/gap-analysis.md) | 34 temuan antara spesifikasi frontend & backend |
| [docs/erd.md](docs/erd.md) | Entity Relationship Diagram (Conceptual + Logical) |
| [docs/database-schema.md](docs/database-schema.md) | Spesifikasi kolom PostgreSQL per tabel |
| [docs/api-contract.md](docs/api-contract.md) | Kontrak API lengkap (45+ endpoint) |
| [docs/wireframe-spec.md](docs/wireframe-spec.md) | Wireframe spec 13 halaman frontend |

> Referensi perencanaan awal: [frontend.md](frontend.md) · [backend.md](backend.md)

---

## Branching Strategy

```
main          → production-ready, hanya merge dari develop
develop       → integrasi, default branch untuk PR
feature/xxx   → fitur baru  (branch dari develop)
fix/xxx       → bug fix     (branch dari develop)
docs/xxx      → dokumentasi (branch dari develop)
```

**Aturan merge:**
- PR ke `develop` → review 1 orang sudah cukup
- PR ke `main` → wajib review keduanya

---

## Setup

### Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

> Lihat [backend/README.md](backend/README.md) untuk detail konfigurasi.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

> Lihat [frontend/README.md](frontend/README.md) untuk detail konfigurasi.

---

## Role & Akses

| Role | Akses |
|---|---|
| Admin | Pasien, Jadwal, Pembayaran (cabang sendiri) |
| Dokter | Rekam Medis, jadwal pribadi (cabang sendiri) |
| Owner | Semua cabang + Laporan + Master Data |

---

## Status Proyek

- [x] Dokumentasi & Analisis Sistem
- [ ] Setup Backend (Laravel)
- [ ] Setup Frontend (React)
- [ ] Implementasi Phase 1: Auth + Master Data
- [ ] Implementasi Phase 2: Pasien + Janji Temu
- [ ] Implementasi Phase 3: Rekam Medis + Odontogram
- [ ] Implementasi Phase 4: Pembayaran + Laporan
