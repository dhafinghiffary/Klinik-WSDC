# Frontend — React + TypeScript

**Owner:** dhafinghiffary  
**Stack:** React 19 · TypeScript · Vite · Shadcn UI · TanStack Query · React Hook Form · Zod

---

## Referensi Dokumentasi

| Dokumen | Relevansi |
|---|---|
| [docs/wireframe-spec.md](../docs/wireframe-spec.md) | Wireframe spec 13 halaman (implementasi utama) |
| [docs/api-contract.md](../docs/api-contract.md) | Kontrak API (request/response semua endpoint) |
| [docs/gap-analysis.md](../docs/gap-analysis.md) | Isu terbuka yang perlu dikonfirmasi |

---

## Struktur Folder (setelah `npm create vite@latest`)

```
frontend/
├── public/
├── src/
│   ├── api/              # axios instance + per-module API calls
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── appointments.ts
│   │   ├── medicalRecords.ts
│   │   ├── payments.ts
│   │   └── reports.ts
│   ├── components/
│   │   ├── ui/           # Shadcn UI components (auto-generated)
│   │   └── shared/       # AlertDialog, Toast, Skeleton, dll
│   ├── hooks/            # TanStack Query custom hooks
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   └── AppLayout.tsx  # Header + Sidebar
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── patients/
│   │   │   ├── PatientListPage.tsx
│   │   │   ├── PatientDetailPage.tsx
│   │   │   └── PatientFormPage.tsx
│   │   ├── appointments/
│   │   │   ├── AppointmentListPage.tsx
│   │   │   └── AppointmentFormPage.tsx
│   │   ├── medicalRecords/
│   │   │   ├── MedicalRecordFormPage.tsx
│   │   │   └── MedicalRecordDetailPage.tsx
│   │   ├── payments/
│   │   │   ├── PaymentFormPage.tsx
│   │   │   └── PaymentHistoryPage.tsx
│   │   ├── reports/
│   │   │   └── ReportsPage.tsx
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   └── errors/
│   │       ├── NotFoundPage.tsx
│   │       └── ForbiddenPage.tsx
│   ├── router/
│   │   ├── index.tsx      # React Router v6 config
│   │   └── ProtectedRoute.tsx
│   ├── stores/            # Zustand — auth state, user, branch
│   ├── types/             # TypeScript interfaces & enums
│   │   ├── api.ts         # Standard response envelope
│   │   ├── patient.ts
│   │   ├── appointment.ts
│   │   ├── medicalRecord.ts
│   │   └── payment.ts
│   ├── utils/
│   │   ├── currency.ts    # Intl.NumberFormat IDR
│   │   └── date.ts        # dayjs helpers
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── index.html
├── tsconfig.json
├── vite.config.ts
└── components.json        # Shadcn UI config
```

---

## Setup (setelah folder ini diisi)

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Library Utama

| Library | Versi | Kegunaan |
|---|---|---|
| react | ^19 | Framework UI |
| typescript | ^5 | Type safety |
| vite | ^6 | Build tool |
| @tanstack/react-query | ^5 | Server state management |
| react-hook-form | ^7 | Form handling |
| zod | ^3 | Schema validation |
| react-router-dom | ^6 | Routing |
| axios | ^1 | HTTP client |
| dayjs | ^1 | Date formatting |
| recharts | ^2 | Charts (Dashboard & Reports) |
| zustand | ^4 | Client state (auth, user) |
| sonner | ^1 | Toast notifications |

> Semua UI components dari [shadcn/ui](https://ui.shadcn.com/) — install per-komponen via `npx shadcn@latest add`.

---

## Konvensi

- **Penamaan file:** PascalCase untuk komponen, camelCase untuk utils/hooks
- **API calls:** Semua via custom hooks di `src/hooks/` menggunakan TanStack Query
- **Form:** React Hook Form + Zod schema — lihat wireframe spec untuk validasi per field
- **Currency:** Selalu format IDR dengan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`
- **Date:** dayjs dengan locale `id` untuk format Indonesia
- **Auth token:** Simpan di localStorage, inject via axios interceptor

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
