# Frontend — React + TypeScript

**Owner:** dhafinghiffary
**Stack:** React 19 · TypeScript · Vite · Tailwind v4 · Shadcn UI · TanStack Query · React Hook Form · Zod

---

## Referensi Dokumentasi

| Dokumen | Relevansi |
|---|---|
| [docs/wireframe-spec.md](../docs/wireframe-spec.md) | Wireframe spec 13 halaman (implementasi utama) |
| [docs/api-contract.md](../docs/api-contract.md) | Kontrak API (request/response semua endpoint) |
| [docs/gap-analysis.md](../docs/gap-analysis.md) | Isu terbuka yang perlu dikonfirmasi |

---

## Struktur Folder

```
frontend/
├── public/
├── src/
│   ├── api/              # axios instance + per-module API calls
│   │   ├── client.ts     # axios instance + interceptor (token, error)
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── appointments.ts
│   │   ├── medical-records.ts
│   │   ├── payments.ts
│   │   ├── reports.ts
│   │   └── master.ts
│   ├── components/
│   │   ├── ui/           # Shadcn UI components (npx shadcn add ...)
│   │   └── shared/       # komponen reusable lintas halaman
│   ├── config/
│   │   └── navigation.ts # item sidebar per role
│   ├── constants/
│   │   └── roles.ts      # konstanta role & helper
│   ├── hooks/            # TanStack Query custom hooks
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   └── AppLayout.tsx # Header + Sidebar
│   ├── lib/
│   │   ├── query-client.ts
│   │   └── utils.ts      # cn() helper (Shadcn)
│   ├── pages/            # satu folder per modul
│   │   ├── auth/ dashboard/ patients/ appointments/
│   │   ├── medical-records/ payments/ reports/ settings/
│   │   └── errors/       # 403, 404
│   ├── router/
│   │   ├── index.tsx     # React Router v6 config
│   │   └── ProtectedRoute.tsx
│   ├── stores/           # Zustand — auth state, user, branch
│   │   └── auth-store.ts
│   ├── types/            # TypeScript interfaces & enums
│   │   ├── api.ts        # Standard response envelope
│   │   ├── auth.ts patient.ts appointment.ts
│   │   ├── medical-record.ts payment.ts
│   ├── utils/
│   │   ├── currency.ts   # Intl.NumberFormat IDR
│   │   └── date.ts       # dayjs helpers
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css         # Tailwind + Shadcn theme variables
├── .env.example
├── components.json       # Shadcn UI config
├── index.html
├── tsconfig.json
└── vite.config.ts
```

---

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENABLE_MOCK=true   # pakai Mock API (MSW), tanpa backend
```

---

## Mock API (MSW)

Untuk testing frontend **tanpa backend**, aktifkan Mock API via `VITE_ENABLE_MOCK=true` di `.env.local`.

- Handler & data dummy ada di `src/mocks/`
- Akun demo (password semua `password`): `owner@wsdc.test`, `admin@wsdc.test`, `dokter@wsdc.test`
- Contoh halaman yang sudah pakai data mock: **Daftar Pasien** (`/patients`)
- Set `VITE_ENABLE_MOCK=false` saat backend Laravel sudah jalan

Menambah endpoint mock: buat handler di `src/mocks/handlers/` lalu daftarkan di `handlers/index.ts`.

---

## Menambah Komponen Shadcn

Foundation (Tailwind, theme variables, `cn()`, `components.json`) sudah siap. Tambahkan komponen sesuai kebutuhan:

```bash
npx shadcn@latest add button card input label table dialog
```

Komponen masuk ke `src/components/ui/`.

---

## Library Utama

| Library | Kegunaan |
|---|---|
| react 19 | Framework UI |
| typescript | Type safety |
| vite | Build tool |
| tailwindcss v4 | Styling |
| shadcn/ui | Komponen UI |
| @tanstack/react-query | Server state management |
| react-hook-form + zod | Form & validasi |
| react-router-dom | Routing |
| axios | HTTP client |
| zustand | Client state (auth, user, branch) |
| dayjs | Date formatting |
| recharts | Charts (Dashboard & Reports) |
| sonner | Toast notifications |
| lucide-react | Icons |

---

## Konvensi

- **Penamaan file:** PascalCase untuk komponen (`PatientList.tsx`), kebab-case untuk non-komponen (`auth-store.ts`)
- **API calls:** Semua via custom hooks di `src/hooks/` menggunakan TanStack Query
- **Form:** React Hook Form + Zod schema — lihat wireframe spec untuk validasi per field
- **Currency:** `formatIDR()` dari `src/utils/currency.ts`
- **Date:** helper dari `src/utils/date.ts` (dayjs, locale `id`)
- **Path alias:** `@/` → `src/` (mis. `import { cn } from "@/lib/utils"`)
- **Auth token:** localStorage, di-inject via axios interceptor

---

## Halaman & Route

| Route | Halaman | Role |
|---|---|---|
| `/login` | LoginPage | Public |
| `/dashboard` | DashboardPage | Admin, Dokter, Owner |
| `/patients` | PatientListPage | Admin, Owner |
| `/patients/create` | PatientFormPage | Admin |
| `/patients/:id` | PatientDetailPage | Admin, Dokter, Owner |
| `/patients/:id/edit` | PatientFormPage | Admin |
| `/appointments` | AppointmentListPage | Admin, Dokter |
| `/appointments/create` | AppointmentFormPage | Admin |
| `/medical-records/create` | MedicalRecordFormPage | Dokter |
| `/medical-records/:id` | MedicalRecordDetailPage | Dokter, Admin |
| `/medical-records/:id/edit` | MedicalRecordFormPage | Dokter |
| `/payments/create` | PaymentFormPage | Admin |
| `/payments` | PaymentHistoryPage | Admin, Owner |
| `/reports` | ReportsPage | Owner |
| `/settings` | SettingsPage | Owner |
