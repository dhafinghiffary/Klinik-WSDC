# Backend — Laravel 12

**Owner:** SShineee  
**Stack:** Laravel 12 · Laravel Sanctum · PostgreSQL 15 · Cloudflare R2

---

## Referensi Dokumentasi

| Dokumen | Relevansi |
|---|---|
| [docs/database-schema.md](../docs/database-schema.md) | Spesifikasi tabel & kolom PostgreSQL |
| [docs/erd.md](../docs/erd.md) | Entity Relationship Diagram |
| [docs/api-contract.md](../docs/api-contract.md) | Kontrak API lengkap |
| [docs/gap-analysis.md](../docs/gap-analysis.md) | Isu yang harus diselesaikan sebelum dev |

---

## Arsitektur

- **Auth:** Sanctum Personal Access Token (bukan SPA cookie) — mendukung React dan Flutter dari domain berbeda
- **Multi-Branch:** Global Eloquent scope memfilter `branch_id` otomatis per user; Owner bypass scope
- **Storage:** File foto pasien disimpan di Cloudflare R2 via S3 driver

## Status Kerangka

Kerangka backend sudah di-scaffold (Laravel 12 + Sanctum). Sudah tersedia:

- **19 migrasi** sesuai [docs/database-schema.md](../docs/database-schema.md) (urutan dependency, index, CHECK constraint, `pg_trgm`).
- **17 Eloquent model** + `BranchScope` global scope (filter `branch_id` otomatis, Owner bypass).
- **Auth Sanctum** (`login`/`logout`/`me`) + middleware `role:` + 4 Policy.
- **Controller Api/V1**, Form Request, & API Resource untuk seluruh modul (45+ endpoint, lihat `routes/api.php` → 55 route).
- **Seeder**: role, 3 cabang, akun per-role, kondisi odontogram, master tindakan.

Cek seluruh route: `php artisan route:list --path=api/v1`.

### Akun Seed (testing)

| Role | Email | Password | Cabang |
|---|---|---|---|
| Owner | `owner@wsdc.test` | `password` | (lintas cabang) |
| Admin | `admin@wsdc.test` | `password` | WSDC-A |
| Dokter | `dokter@wsdc.test` | `password` | WSDC-A, WSDC-B |

> Catatan: tipe enum diimplementasikan sebagai kolom + CHECK constraint (portable). Endpoint kompleks (rekam medis agregat, pembayaran) sudah memakai `DB::transaction`; logika lanjutan mengikuti roadmap [backend.md](../backend.md) Bagian 11.

## Struktur Folder (setelah `laravel new`)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   ├── Policies/
│   └── Scopes/          # BranchScope global
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
├── tests/
│   ├── Feature/
│   └── Unit/
└── .env.example
```

## Setup (setelah folder ini diisi Laravel)

```bash
cp .env.example .env
composer install
php artisan key:generate

# Konfigurasi .env:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=wsdc_klinik
# DB_USERNAME=...
# DB_PASSWORD=...
# FILESYSTEM_DISK=r2
# AWS_ACCESS_KEY_ID=... (Cloudflare R2)
# AWS_SECRET_ACCESS_KEY=...
# AWS_DEFAULT_REGION=auto
# AWS_BUCKET=...
# AWS_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com

php artisan migrate
php artisan db:seed
php artisan serve
```

## Environment Variables

| Variabel | Keterangan |
|---|---|
| `APP_URL` | URL backend (digunakan Sanctum) |
| `SANCTUM_STATEFUL_DOMAINS` | Domain React frontend |
| `DB_*` | Koneksi PostgreSQL |
| `AWS_*` | Cloudflare R2 credentials |

---

## API Base URL

```
/api/v1
```

Semua endpoint memerlukan header:
```
Authorization: Bearer {token}
Accept: application/json
```

---

## Database

19 tabel, lihat [docs/database-schema.md](../docs/database-schema.md).

Urutan migrasi mengikuti dependency order yang sudah ditentukan di dokumen tersebut.

**Extension PostgreSQL yang diperlukan:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```
