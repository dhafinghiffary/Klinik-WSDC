# API Contract — Widya Santi Dental Care (WSDC)

**Versi Dokumen:** 1.0  
**Tanggal:** 15 Juni 2026  
**Sumber:** `frontend.md` v1.0 + `backend.md` v1.0 + `database-schema.md` v1.0  
**Base URL:** `/api/v1`  
**Audience:** Frontend Developer (React/Flutter), Backend Developer  
**Status:** Draft

---

## Konvensi Umum

### Format Response

Seluruh endpoint mengembalikan JSON dengan struktur:

```json
{
  "success": true,
  "message": "Pesan deskriptif",
  "data": { } // atau [ ]
}
```

Endpoint list menambahkan:
```json
{
  "success": true,
  "message": "OK",
  "data": [ ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 100,
      "last_page": 7,
      "from": 1,
      "to": 15
    }
  }
}
```

### Format Error

**Validasi (422):**
```json
{
  "success": false,
  "message": "Data tidak valid.",
  "errors": {
    "field_name": ["Pesan error pertama.", "Pesan error kedua."]
  }
}
```

**Autentikasi gagal (401):**
```json
{ "success": false, "message": "Unauthenticated." }
```

**Tidak ada izin (403):**
```json
{ "success": false, "message": "Akses tidak diizinkan." }
```

**Tidak ditemukan (404):**
```json
{ "success": false, "message": "Data tidak ditemukan." }
```

**Server error (500):**
```json
{ "success": false, "message": "Terjadi kesalahan pada server." }
```

### Header Wajib (seluruh endpoint kecuali login)

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### Notasi Hak Akses

- `[ALL]` — Admin, Dokter, Owner.
- `[ADMIN]` — hanya Admin.
- `[DOCTOR]` — hanya Dokter.
- `[OWNER]` — hanya Owner.
- `[ADMIN, OWNER]` — Admin dan Owner.
- `[DOCTOR, OWNER]` — Dokter dan Owner.

---

## 1. Authentication

### 1.1 Login

```
POST /api/v1/login
```

**Permission:** Public (tidak memerlukan token).

**Request Body:**
```json
{
  "email": "admin@wsdc.id",
  "password": "rahasia123"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `email` | required, string, email format, max:200 |
| `password` | required, string, min:6 |

**Response 200:**
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "1|abc123tokenstring...",
    "user": {
      "id": 1,
      "name": "Siti Rahayu",
      "email": "admin@wsdc.id",
      "role": {
        "id": 1,
        "name": "admin",
        "display_name": "Administrator"
      },
      "branch": {
        "id": 2,
        "name": "WSDC Cabang B",
        "code": "WSB"
      },
      "is_active": true
    }
  }
}
```

**Response 422 (validasi gagal):**  
Field errors pada `email` atau `password`.

**Response 401 (kredensial salah):**
```json
{ "success": false, "message": "Email atau password salah." }
```

---

### 1.2 Logout

```
POST /api/v1/logout
```

**Permission:** `[ALL]`

**Request Body:** Tidak ada.

**Response 200:**
```json
{ "success": true, "message": "Logout berhasil." }
```

---

### 1.3 Get Current User

```
GET /api/v1/me
```

**Permission:** `[ALL]`

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "name": "Siti Rahayu",
    "email": "admin@wsdc.id",
    "role": {
      "id": 1,
      "name": "admin",
      "display_name": "Administrator"
    },
    "branch": {
      "id": 2,
      "name": "WSDC Cabang B",
      "code": "WSB"
    },
    "doctor_profile": null,
    "is_active": true
  }
}
```

Jika user adalah dokter, `doctor_profile` terisi:
```json
"doctor_profile": {
  "id": 3,
  "name": "drg. Budi Santoso",
  "sip_number": "SIP/2024/001",
  "specialization": "Dokter Gigi Umum",
  "branches": [
    { "id": 1, "name": "WSDC Cabang A", "code": "WSA" },
    { "id": 2, "name": "WSDC Cabang B", "code": "WSB" }
  ]
}
```

---

### 1.4 Ubah Password Akun Pribadi

```
PUT /api/v1/me/password
```

**Permission:** `[ALL]`

**Request Body:**
```json
{
  "current_password": "rahasialama",
  "new_password": "rahasiabaru123",
  "new_password_confirmation": "rahasiabaru123"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `current_password` | required, string — divalidasi sesuai password hash saat ini |
| `new_password` | required, string, min:8, confirmed |
| `new_password_confirmation` | required, sama dengan `new_password` |

**Response 200:**
```json
{ "success": true, "message": "Password berhasil diubah." }
```

---

### 1.5 Switch Cabang Aktif (Dokter Multi-Cabang / Owner)

```
POST /api/v1/me/switch-branch
```

**Permission:** `[DOCTOR, OWNER]`

**Request Body:**
```json
{ "branch_id": 2 }
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `branch_id` | required, integer, exists:branches,id, user must be assigned to this branch |

**Response 200:**
```json
{
  "success": true,
  "message": "Cabang aktif diubah.",
  "data": {
    "active_branch": { "id": 2, "name": "WSDC Cabang B", "code": "WSB" }
  }
}
```

---

## 2. Patients

### 2.1 List Pasien

```
GET /api/v1/patients
```

**Permission:** `[ADMIN, OWNER]` (Dokter: akses terbatas untuk lookup saat input rekam medis).

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `search` | string | Cari berdasarkan nama, NIK, nomor HP, atau nomor RM |
| `branch_id` | integer | Filter cabang (hanya Owner; Admin otomatis terbatas ke cabangnya) |
| `gender` | string | Filter: `male` atau `female` |
| `page` | integer | Halaman pagination (default: 1) |
| `per_page` | integer | Jumlah data per halaman (default: 15, max: 100) |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 10,
      "medical_record_number": "WSA-2026-000001",
      "name": "Andi Wijaya",
      "birth_date": "1990-05-20",
      "age": 36,
      "gender": "male",
      "phone_number": "08123456789",
      "home_branch": { "id": 1, "name": "WSDC Cabang A", "code": "WSA" },
      "created_at": "2026-01-10T08:00:00Z"
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

### 2.2 Buat Pasien Baru

```
POST /api/v1/patients
```

**Permission:** `[ADMIN]`

**Request Body:**
```json
{
  "name": "Andi Wijaya",
  "nik": "3201234567890001",
  "birth_place": "Bandung",
  "birth_date": "1990-05-20",
  "gender": "male",
  "address": "Jl. Merdeka No. 10, Bandung",
  "phone_number": "08123456789",
  "occupation": "Karyawan Swasta",
  "guardian_name": null,
  "guardian_phone": null,
  "guardian_relation": null,
  "drug_allergies": "Penisilin",
  "systemic_conditions": "Tidak ada"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `name` | required, string, max:200 |
| `nik` | nullable, string, digits:16, unique:patients,nik |
| `birth_place` | required, string, max:100 |
| `birth_date` | required, date, before:today |
| `gender` | required, in:male,female |
| `address` | required, string |
| `phone_number` | required, string, max:20 |
| `occupation` | nullable, string, max:100 |
| `guardian_name` | nullable, string, max:150 |
| `guardian_phone` | nullable, string, max:20 |
| `guardian_relation` | nullable, string, max:50 |
| `drug_allergies` | nullable, string |
| `systemic_conditions` | nullable, string |

**Response 201:**
```json
{
  "success": true,
  "message": "Pasien berhasil didaftarkan.",
  "data": {
    "id": 10,
    "medical_record_number": "WSA-2026-000001",
    "name": "Andi Wijaya",
    ...
  }
}
```

---

### 2.3 Detail Pasien

```
GET /api/v1/patients/{id}
```

**Permission:** `[ADMIN, OWNER]` (Dokter: read-only).

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 10,
    "medical_record_number": "WSA-2026-000001",
    "name": "Andi Wijaya",
    "nik": "3201234567890001",
    "birth_place": "Bandung",
    "birth_date": "1990-05-20",
    "age": 36,
    "gender": "male",
    "address": "Jl. Merdeka No. 10, Bandung",
    "phone_number": "08123456789",
    "occupation": "Karyawan Swasta",
    "guardian_name": null,
    "guardian_phone": null,
    "guardian_relation": null,
    "drug_allergies": "Penisilin",
    "systemic_conditions": "Tidak ada",
    "home_branch": { "id": 1, "name": "WSDC Cabang A", "code": "WSA" },
    "stats": {
      "total_visits": 5,
      "last_visit_date": "2026-05-10"
    },
    "created_at": "2026-01-10T08:00:00Z"
  }
}
```

---

### 2.4 Update Data Pasien

```
PUT /api/v1/patients/{id}
```

**Permission:** `[ADMIN]`

**Request Body:** Sama dengan POST, seluruh field opsional (partial update diperbolehkan). Field `medical_record_number` dan `home_branch_id` tidak dapat diubah melalui endpoint ini.

**Validation Rules:** Sama dengan POST 2.2, semua field menjadi `nullable` / opsional kecuali yang memang wajib.

**Response 200:**
```json
{
  "success": true,
  "message": "Data pasien berhasil diperbarui.",
  "data": { ... }
}
```

---

### 2.5 Riwayat Kunjungan Pasien

```
GET /api/v1/patients/{id}/history
```

**Permission:** `[ALL]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `page` | integer | Pagination |
| `per_page` | integer | Default: 10 |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "appointment_id": 20,
      "medical_record_id": 15,
      "visit_date": "2026-05-10",
      "doctor": { "id": 3, "name": "drg. Budi Santoso" },
      "branch": { "id": 1, "name": "WSDC Cabang A" },
      "treatments_summary": ["Scaling", "Tambal Gigi Komposit"],
      "total_amount": 350000,
      "payment_status": "paid"
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

### 2.6 Riwayat Rekam Medis Pasien

```
GET /api/v1/patients/{id}/medical-records
```

**Permission:** `[DOCTOR, OWNER]` (Admin: hanya summary tindakan untuk billing).

**Query Parameters:** `page`, `per_page`.

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 15,
      "visit_date": "2026-05-10",
      "doctor": { "id": 3, "name": "drg. Budi Santoso" },
      "branch": { "id": 1, "name": "WSDC Cabang A" },
      "anamnesis": "Pasien mengeluh sakit gigi...",
      "diagnoses": [
        { "id": 5, "diagnosis_name": "Karies Dentin", "tooth_number": "16" }
      ],
      "treatments": [
        { "id": 8, "name": "Scaling", "price": 150000 },
        { "id": 9, "name": "Tambal Gigi Komposit", "price": 200000, "tooth_number": "16" }
      ],
      "prescriptions": [
        { "medicine_name": "Amoksisilin 500mg", "dosage": "500mg", "frequency": "3x1", "quantity": 10 }
      ]
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

### 2.7 Riwayat Pembayaran Pasien

```
GET /api/v1/patients/{id}/payments
```

**Permission:** `[ADMIN, OWNER]`

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 7,
      "invoice_number": "INV-WSA-202605-0001",
      "visit_date": "2026-05-10",
      "final_amount": 350000,
      "payment_method": "cash",
      "status": "paid",
      "paid_at": "2026-05-10T11:30:00Z"
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

## 3. Doctors (Master Data)

### 3.1 List Dokter

```
GET /api/v1/doctors
```

**Permission:** `[ALL]` (read-only untuk dropdown dan referensi).

**Query Parameters:** `branch_id` (filter dokter per cabang), `search` (nama dokter).

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 3,
      "name": "drg. Budi Santoso",
      "sip_number": "SIP/2024/001",
      "specialization": "Dokter Gigi Umum",
      "branches": [
        { "id": 1, "name": "WSDC Cabang A", "code": "WSA" }
      ]
    }
  ]
}
```

---

### 3.2 Detail Dokter

```
GET /api/v1/doctors/{id}
```

**Permission:** `[OWNER]`

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 3,
    "user_id": 5,
    "name": "drg. Budi Santoso",
    "sip_number": "SIP/2024/001",
    "specialization": "Dokter Gigi Umum",
    "signature_image_path": null,
    "branches": [
      {
        "id": 1,
        "name": "WSDC Cabang A",
        "schedule": { "days": ["monday", "wednesday"], "start_time": "08:00", "end_time": "12:00" }
      }
    ]
  }
}
```

---

### 3.3 Tambah Dokter

```
POST /api/v1/doctors
```

**Permission:** `[OWNER]`

**Request Body:**
```json
{
  "name": "drg. Budi Santoso",
  "email": "budi@wsdc.id",
  "password": "rahasia123",
  "sip_number": "SIP/2024/001",
  "specialization": "Dokter Gigi Umum",
  "branch_assignments": [
    {
      "branch_id": 1,
      "schedule": { "days": ["monday", "wednesday"], "start_time": "08:00", "end_time": "12:00" }
    }
  ]
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `name` | required, string, max:150 |
| `email` | required, email, unique:users,email, max:200 |
| `password` | required, string, min:8 |
| `sip_number` | nullable, string, max:50 |
| `specialization` | nullable, string, max:100 |
| `branch_assignments` | required, array, min:1 |
| `branch_assignments.*.branch_id` | required, integer, exists:branches,id |
| `branch_assignments.*.schedule` | nullable, json |

**Response 201:**
```json
{ "success": true, "message": "Dokter berhasil ditambahkan.", "data": { ... } }
```

---

### 3.4 Update Dokter

```
PUT /api/v1/doctors/{id}
```

**Permission:** `[OWNER]`

**Request Body:** Sama dengan POST 3.3, semua field opsional. `password` opsional (hanya diubah jika diisi).

**Response 200:**
```json
{ "success": true, "message": "Data dokter berhasil diperbarui.", "data": { ... } }
```

---

### 3.5 Hapus Dokter (Soft Delete)

```
DELETE /api/v1/doctors/{id}
```

**Permission:** `[OWNER]`

**Response 200:**
```json
{ "success": true, "message": "Dokter berhasil dinonaktifkan." }
```

---

### 3.6 Jadwal Dokter

```
GET /api/v1/doctors/{id}/schedule
```

**Permission:** `[ALL]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `branch_id` | integer | Filter cabang tertentu |
| `year` | integer | Tahun (default: tahun ini) |
| `month` | integer | Bulan (default: bulan ini) |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "doctor": { "id": 3, "name": "drg. Budi Santoso" },
    "branch": { "id": 1, "name": "WSDC Cabang A" },
    "schedule": { "days": ["monday", "wednesday"], "start_time": "08:00", "end_time": "12:00" },
    "appointments_this_month": [
      { "date": "2026-06-02", "count": 4 },
      { "date": "2026-06-04", "count": 3 }
    ]
  }
}
```

---

## 4. Appointments

### 4.1 List Appointment

```
GET /api/v1/appointments
```

**Permission:** `[ADMIN, OWNER]` (Dokter: hanya jadwal miliknya sendiri).

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `date` | date (YYYY-MM-DD) | Filter tanggal spesifik |
| `branch_id` | integer | Filter cabang (Owner saja; Admin otomatis) |
| `doctor_id` | integer | Filter dokter |
| `status` | string | Filter status: `scheduled`,`checked_in`,`in_progress`,`completed`,`cancelled`,`no_show` |
| `page` | integer | Pagination |
| `per_page` | integer | Default: 20 |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 20,
      "appointment_date": "2026-06-16",
      "appointment_time": "09:00:00",
      "status": "scheduled",
      "notes": "Pasien menghubungi via WA",
      "patient": { "id": 10, "name": "Andi Wijaya", "medical_record_number": "WSA-2026-000001", "phone_number": "08123456789" },
      "doctor": { "id": 3, "name": "drg. Budi Santoso" },
      "branch": { "id": 1, "name": "WSDC Cabang A" },
      "medical_record_id": null
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

### 4.2 Daftar Kunjungan Hari Ini

```
GET /api/v1/appointments/today
```

**Permission:** `[ALL]`

Endpoint shortcut — otomatis filter ke tanggal hari ini dan `branch_id` pengguna yang login. Owner dapat melewatkan `branch_id` untuk melihat semua cabang.

**Query Parameters:** `branch_id` (opsional, hanya untuk Owner), `doctor_id` (opsional).

**Response 200:** Sama dengan struktur 4.1.

---

### 4.3 Buat Appointment

```
POST /api/v1/appointments
```

**Permission:** `[ADMIN]`

**Request Body:**
```json
{
  "patient_id": 10,
  "doctor_id": 3,
  "branch_id": 1,
  "appointment_date": "2026-06-20",
  "appointment_time": "09:00",
  "notes": "Pasien ingin scaling dan konsultasi"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `patient_id` | required, integer, exists:patients,id |
| `doctor_id` | required, integer, exists:doctors,id, doctor must be assigned to branch_id |
| `branch_id` | required, integer, exists:branches,id |
| `appointment_date` | required, date, after_or_equal:today |
| `appointment_time` | nullable, date_format:H:i |
| `notes` | nullable, string, max:500 |

**Response 201:**
```json
{
  "success": true,
  "message": "Appointment berhasil dibuat.",
  "data": { "id": 20, ... }
}
```

---

### 4.4 Detail Appointment

```
GET /api/v1/appointments/{id}
```

**Permission:** `[ADMIN, OWNER]` (Dokter: hanya appointment miliknya).

**Response 200:** Sama dengan satu item dari list 4.1, ditambah full detail.

---

### 4.5 Update Appointment

```
PUT /api/v1/appointments/{id}
```

**Permission:** `[ADMIN]`

**Request Body:** Field yang ingin diubah (reschedule, ganti dokter, ubah catatan).

**Constraint:** Appointment dengan status `completed` atau `cancelled` tidak dapat diubah.

**Response 200:**
```json
{ "success": true, "message": "Appointment berhasil diperbarui.", "data": { ... } }
```

---

### 4.6 Update Status Appointment

```
PATCH /api/v1/appointments/{id}/status
```

**Permission:** `[ADMIN]` (check-in, cancel); `[DOCTOR]` (in_progress, completed).

**Request Body:**
```json
{ "status": "checked_in" }
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `status` | required, in:scheduled,checked_in,in_progress,completed,cancelled,no_show |

**Business Rules:**
- Transisi status yang valid: `scheduled` → `checked_in` → `in_progress` → `completed`.
- `cancelled` dan `no_show` hanya bisa dari `scheduled` atau `checked_in`.
- Tidak bisa kembali ke status sebelumnya.

**Response 200:**
```json
{ "success": true, "message": "Status appointment diperbarui.", "data": { "id": 20, "status": "checked_in" } }
```

---

## 5. Medical Records

### 5.1 List Rekam Medis

```
GET /api/v1/medical-records
```

**Permission:** `[DOCTOR, OWNER]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `patient_id` | integer | Filter per pasien |
| `doctor_id` | integer | Filter per dokter |
| `branch_id` | integer | Filter per cabang (Owner saja) |
| `date_from` | date | Awal rentang tanggal kunjungan |
| `date_to` | date | Akhir rentang tanggal kunjungan |
| `page` | integer | Pagination |
| `per_page` | integer | Default: 15 |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 15,
      "visit_date": "2026-05-10",
      "patient": { "id": 10, "name": "Andi Wijaya", "medical_record_number": "WSA-2026-000001" },
      "doctor": { "id": 3, "name": "drg. Budi Santoso" },
      "branch": { "id": 1, "name": "WSDC Cabang A" },
      "treatments_count": 2,
      "has_payment": true
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

### 5.2 Buat Rekam Medis (Agregat)

```
POST /api/v1/medical-records
```

**Permission:** `[DOCTOR]`

Endpoint ini menyimpan rekam medis lengkap dalam satu request dan satu database transaction.

**Request Body:**
```json
{
  "patient_id": 10,
  "doctor_id": 3,
  "branch_id": 1,
  "appointment_id": 20,
  "visit_date": "2026-06-16",
  "anamnesis": "Pasien mengeluh sakit gigi kanan bawah sejak 3 hari lalu, terasa berdenyut...",
  "additional_notes": "Pasien diminta kontrol 1 minggu lagi.",
  "diagnoses": [
    {
      "diagnosis_code": null,
      "diagnosis_name": "Karies Dentin",
      "tooth_number": "46",
      "notes": null
    }
  ],
  "treatments": [
    {
      "treatment_master_id": 5,
      "name": "Tambal Gigi Komposit",
      "tooth_number": "46",
      "price": 200000,
      "notes": "Tumpatan kelas II"
    },
    {
      "treatment_master_id": null,
      "name": "Konsultasi",
      "tooth_number": null,
      "price": 50000,
      "notes": null
    }
  ],
  "prescriptions": [
    {
      "medicine_name": "Amoksisilin 500mg",
      "dosage": "500mg",
      "frequency": "3x1",
      "quantity": 10,
      "notes": "Diminum setelah makan"
    },
    {
      "medicine_name": "Paracetamol 500mg",
      "dosage": "500mg",
      "frequency": "3x1 jika nyeri",
      "quantity": 10,
      "notes": null
    }
  ],
  "odontogram": [
    { "tooth_number": "46", "condition_code": "caries", "notes": "Karies oklusal" },
    { "tooth_number": "11", "condition_code": "filled_composite", "notes": null }
  ]
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `patient_id` | required, integer, exists:patients,id |
| `doctor_id` | required, integer, exists:doctors,id |
| `branch_id` | required, integer, exists:branches,id |
| `appointment_id` | nullable, integer, exists:appointments,id, unique:medical_records,appointment_id |
| `visit_date` | required, date |
| `anamnesis` | required, string |
| `additional_notes` | nullable, string |
| `diagnoses` | nullable, array |
| `diagnoses.*.diagnosis_name` | required_with:diagnoses.*, string, max:300 |
| `diagnoses.*.diagnosis_code` | nullable, string, max:20 |
| `diagnoses.*.tooth_number` | nullable, string, max:10 |
| `treatments` | required, array, min:1 |
| `treatments.*.name` | required, string, max:200 |
| `treatments.*.price` | required, numeric, min:0 |
| `treatments.*.tooth_number` | nullable, string, max:10 |
| `treatments.*.treatment_master_id` | nullable, integer, exists:treatment_masters,id |
| `prescriptions` | nullable, array |
| `prescriptions.*.medicine_name` | required_with:prescriptions.*, string, max:200 |
| `prescriptions.*.dosage` | required_with:prescriptions.*, string, max:50 |
| `prescriptions.*.frequency` | required_with:prescriptions.*, string, max:100 |
| `prescriptions.*.quantity` | required_with:prescriptions.*, integer, min:1 |
| `odontogram` | nullable, array |
| `odontogram.*.tooth_number` | required_with:odontogram.*, string, max:5 — FDI notation |
| `odontogram.*.condition_code` | required_with:odontogram.*, string, exists:odontogram_conditions,code |

**Response 201:**
```json
{
  "success": true,
  "message": "Rekam medis berhasil disimpan.",
  "data": {
    "id": 15,
    "visit_date": "2026-06-16",
    "patient": { ... },
    "doctor": { ... },
    "branch": { ... },
    "anamnesis": "...",
    "diagnoses": [ ... ],
    "treatments": [ ... ],
    "prescriptions": [ ... ],
    "odontogram": [ ... ],
    "photos": []
  }
}
```

---

### 5.3 Detail Rekam Medis

```
GET /api/v1/medical-records/{id}
```

**Permission:** `[DOCTOR, OWNER]`

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 15,
    "visit_date": "2026-06-16",
    "patient": {
      "id": 10,
      "name": "Andi Wijaya",
      "medical_record_number": "WSA-2026-000001",
      "drug_allergies": "Penisilin",
      "systemic_conditions": "Tidak ada"
    },
    "doctor": { "id": 3, "name": "drg. Budi Santoso" },
    "branch": { "id": 1, "name": "WSDC Cabang A" },
    "appointment_id": 20,
    "anamnesis": "...",
    "additional_notes": "...",
    "diagnoses": [ { "id": 5, "diagnosis_name": "Karies Dentin", "tooth_number": "46" } ],
    "treatments": [ { "id": 8, "name": "Tambal Gigi Komposit", "price": 200000, "tooth_number": "46" } ],
    "prescriptions": [ { "id": 12, "medicine_name": "Amoksisilin 500mg", ... } ],
    "odontogram": [ { "id": 30, "tooth_number": "46", "condition_code": "caries" } ],
    "photos": [ { "id": 5, "file_url": "https://...", "file_type": "clinical_photo", "caption": "Gigi 46 sebelum tindakan" } ],
    "payment": null
  }
}
```

---

### 5.4 Update Rekam Medis

```
PUT /api/v1/medical-records/{id}
```

**Permission:** `[DOCTOR]` (hanya dokter yang membuat rekam medis, sesuai kebijakan edit yang dikonfirmasi).

**Request Body:** Subset dari field POST 5.2. Sub-array (`diagnoses`, `treatments`, `prescriptions`, `odontogram`) menggantikan seluruh data lama (replace, bukan append).

**Response 200:**
```json
{ "success": true, "message": "Rekam medis berhasil diperbarui.", "data": { ... } }
```

---

### 5.5 Upload Foto Rekam Medis

```
POST /api/v1/medical-records/{id}/photos
```

**Permission:** `[DOCTOR]`

**Request:** `multipart/form-data`

| Field | Tipe | Keterangan |
|---|---|---|
| `file` | file | Wajib. Format: jpg, jpeg, png, pdf. Maks: 5MB |
| `file_type` | string | Wajib. Nilai: `clinical_photo`, `xray`, `before`, `after`, `other` |
| `caption` | string | Opsional. Maks: 255 karakter |

**Validation Rules:**
| Field | Rules |
|---|---|
| `file` | required, file, mimes:jpg,jpeg,png,pdf, max:5120 |
| `file_type` | required, in:clinical_photo,xray,before,after,other |
| `caption` | nullable, string, max:255 |

**Response 201:**
```json
{
  "success": true,
  "message": "Foto berhasil diunggah.",
  "data": {
    "id": 5,
    "file_url": "https://signed-url.r2.cloudflarestorage.com/...",
    "file_type": "clinical_photo",
    "caption": "Gigi 46 sebelum tindakan",
    "created_at": "2026-06-16T10:00:00Z"
  }
}
```

---

### 5.6 Hapus Foto Rekam Medis

```
DELETE /api/v1/medical-records/{id}/photos/{photo_id}
```

**Permission:** `[DOCTOR]` (yang mengupload foto tersebut).

**Response 200:**
```json
{ "success": true, "message": "Foto berhasil dihapus." }
```

---

## 6. Payments

### 6.1 List Pembayaran

```
GET /api/v1/payments
```

**Permission:** `[ADMIN, OWNER]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `branch_id` | integer | Filter cabang (Owner saja; Admin otomatis) |
| `date_from` | date | Awal rentang tanggal `paid_at` |
| `date_to` | date | Akhir rentang tanggal `paid_at` |
| `status` | string | Filter: `pending`,`paid`,`partial`,`cancelled` |
| `payment_method` | string | Filter: `cash`,`transfer` |
| `patient_id` | integer | Filter per pasien |
| `page` | integer | Pagination |
| `per_page` | integer | Default: 15 |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 7,
      "invoice_number": "INV-WSA-202606-0001",
      "patient": { "id": 10, "name": "Andi Wijaya" },
      "doctor": { "id": 3, "name": "drg. Budi Santoso" },
      "branch": { "id": 1, "name": "WSDC Cabang A" },
      "final_amount": 350000,
      "payment_method": "cash",
      "status": "paid",
      "paid_at": "2026-06-16T11:30:00Z"
    }
  ],
  "meta": { "pagination": { ... } }
}
```

---

### 6.2 Buat Pembayaran

```
POST /api/v1/payments
```

**Permission:** `[ADMIN]`

**Request Body:**
```json
{
  "medical_record_id": 15,
  "payment_method": "cash",
  "discount_type": "nominal",
  "discount_value": 50000,
  "paid_amount": 300000,
  "treatment_ids": [8, 9]
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `medical_record_id` | required, integer, exists:medical_records,id, unique:payments,medical_record_id |
| `payment_method` | required, in:cash,transfer |
| `discount_type` | nullable, in:percentage,nominal — required if discount_value provided |
| `discount_value` | nullable, numeric, min:0 — required if discount_type provided |
| `paid_amount` | required, numeric, min:0 |
| `treatment_ids` | required, array, min:1 — setiap item harus ada pada medical_record_id terkait |
| `treatment_ids.*` | integer, exists:treatments,id |

**Business Rules:**
- `total_amount` = SUM(`treatments.price`) dari treatment_ids.
- `discount_amount` = jika `discount_type = percentage`: `total_amount * discount_value / 100`; jika `nominal`: `discount_value`.
- `final_amount` = `total_amount - discount_amount`.
- `change_amount` (kembalian) = `paid_amount - final_amount` (hanya relevan untuk `cash`).
- Jika `paid_amount < final_amount` dan status tidak diberi eksplisit: status = `partial`.

**Response 201:**
```json
{
  "success": true,
  "message": "Pembayaran berhasil diproses.",
  "data": {
    "id": 7,
    "invoice_number": "INV-WSA-202606-0001",
    "total_amount": 350000,
    "discount_amount": 50000,
    "final_amount": 300000,
    "paid_amount": 300000,
    "change_amount": 0,
    "status": "paid",
    "paid_at": "2026-06-16T11:30:00Z",
    "payment_details": [
      { "description": "Tambal Gigi Komposit", "price": 200000, "quantity": 1, "subtotal": 200000 },
      { "description": "Konsultasi", "price": 50000, "quantity": 1, "subtotal": 50000 }
    ]
  }
}
```

---

### 6.3 Detail Pembayaran

```
GET /api/v1/payments/{id}
```

**Permission:** `[ADMIN, OWNER]`

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 7,
    "invoice_number": "INV-WSA-202606-0001",
    "medical_record_id": 15,
    "patient": { "id": 10, "name": "Andi Wijaya", "medical_record_number": "WSA-2026-000001" },
    "doctor": { "id": 3, "name": "drg. Budi Santoso" },
    "branch": { "id": 1, "name": "WSDC Cabang A" },
    "visit_date": "2026-06-16",
    "payment_method": "cash",
    "total_amount": 350000,
    "discount_type": "nominal",
    "discount_value": 50000,
    "discount_amount": 50000,
    "final_amount": 300000,
    "paid_amount": 300000,
    "change_amount": 0,
    "status": "paid",
    "paid_at": "2026-06-16T11:30:00Z",
    "created_by": { "id": 1, "name": "Siti Rahayu" },
    "payment_details": [
      { "description": "Tambal Gigi Komposit", "price": 200000, "quantity": 1, "subtotal": 200000 },
      { "description": "Konsultasi", "price": 50000, "quantity": 1, "subtotal": 50000 }
    ]
  }
}
```

---

### 6.4 Cetak / Unduh Kwitansi (PDF)

```
GET /api/v1/payments/{id}/receipt
```

**Permission:** `[ADMIN, OWNER]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `format` | string | `pdf` (default) atau `json` (untuk preview frontend) |

**Response (format=pdf):**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="INV-WSA-202606-0001.pdf"`
- Body: binary PDF

**Response (format=json):**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "invoice_number": "INV-WSA-202606-0001",
    "clinic_name": "Widya Santi Dental Care",
    "branch_name": "WSDC Cabang A",
    "branch_address": "Jl. Merdeka No. 1, Bandung",
    "patient_name": "Andi Wijaya",
    "patient_mrn": "WSA-2026-000001",
    "doctor_name": "drg. Budi Santoso",
    "visit_date": "16 Juni 2026",
    "items": [
      { "description": "Tambal Gigi Komposit", "price": "Rp 200.000" },
      { "description": "Konsultasi", "price": "Rp 50.000" }
    ],
    "subtotal": "Rp 350.000",
    "discount": "Rp 50.000",
    "total": "Rp 300.000",
    "payment_method": "Tunai",
    "paid_amount": "Rp 300.000",
    "change": "Rp 0",
    "paid_at": "16 Juni 2026, 11:30 WIB"
  }
}
```

---

## 7. Reports

Seluruh endpoint laporan hanya dapat diakses oleh `[OWNER]`. Admin dapat mengakses laporan dengan cakupan terbatas (lihat gap-analysis.md CR-03) jika dikonfirmasi.

---

### 7.1 Laporan Pendapatan Harian

```
GET /api/v1/reports/revenue/daily
```

**Permission:** `[OWNER]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `date` | date (YYYY-MM-DD) | Default: hari ini |
| `branch_id` | integer | Filter cabang (opsional; jika tidak diisi: semua cabang) |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "date": "2026-06-16",
    "branch": null,
    "summary": {
      "total_revenue": 2500000,
      "total_transactions": 8,
      "breakdown_by_method": {
        "cash": { "count": 5, "amount": 1800000 },
        "transfer": { "count": 3, "amount": 700000 }
      }
    },
    "transactions": [
      {
        "invoice_number": "INV-WSA-202606-0001",
        "patient_name": "Andi Wijaya",
        "doctor_name": "drg. Budi Santoso",
        "branch_name": "WSDC Cabang A",
        "final_amount": 300000,
        "payment_method": "cash",
        "paid_at": "2026-06-16T11:30:00Z"
      }
    ]
  }
}
```

---

### 7.2 Laporan Pendapatan Bulanan

```
GET /api/v1/reports/revenue/monthly
```

**Permission:** `[OWNER]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `month` | integer (1-12) | Default: bulan ini |
| `year` | integer | Default: tahun ini |
| `branch_id` | integer | Opsional |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "period": "Juni 2026",
    "summary": {
      "total_revenue": 45000000,
      "total_transactions": 120,
      "avg_revenue_per_day": 1500000
    },
    "daily_trend": [
      { "date": "2026-06-01", "revenue": 2000000, "transactions": 7 },
      { "date": "2026-06-02", "revenue": 1800000, "transactions": 6 }
    ]
  }
}
```

---

### 7.3 Laporan Pendapatan Tahunan

```
GET /api/v1/reports/revenue/yearly
```

**Permission:** `[OWNER]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `year` | integer | Default: tahun ini |
| `branch_id` | integer | Opsional |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "year": 2026,
    "summary": {
      "total_revenue": 350000000,
      "total_transactions": 950
    },
    "monthly_trend": [
      { "month": 1, "month_name": "Januari", "revenue": 28000000, "transactions": 75 },
      { "month": 2, "month_name": "Februari", "revenue": 30000000, "transactions": 82 }
    ]
  }
}
```

---

### 7.4 Laporan Pasien Baru vs Pasien Lama

```
GET /api/v1/reports/patients/new-vs-returning
```

**Permission:** `[OWNER]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `date_from` | date | Awal periode |
| `date_to` | date | Akhir periode |
| `branch_id` | integer | Opsional |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "period": { "from": "2026-06-01", "to": "2026-06-30" },
    "summary": {
      "new_patients": 35,
      "returning_patients": 85,
      "total_visits": 120
    },
    "daily_breakdown": [
      { "date": "2026-06-01", "new": 3, "returning": 7 }
    ]
  }
}
```

---

### 7.5 Laporan Pendapatan per Dokter

```
GET /api/v1/reports/revenue/by-doctor
```

**Permission:** `[OWNER]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `date_from` | date | Wajib |
| `date_to` | date | Wajib |
| `branch_id` | integer | Opsional |
| `doctor_id` | integer | Filter satu dokter (opsional) |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "doctor": { "id": 3, "name": "drg. Budi Santoso" },
      "branch": { "id": 1, "name": "WSDC Cabang A" },
      "total_revenue": 12000000,
      "total_transactions": 35,
      "total_patients": 30
    }
  ]
}
```

---

### 7.6 Laporan Pendapatan per Cabang

```
GET /api/v1/reports/revenue/by-branch
```

**Permission:** `[OWNER]`

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|---|---|---|
| `date_from` | date | Wajib |
| `date_to` | date | Wajib |

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "branch": { "id": 1, "name": "WSDC Cabang A", "code": "WSA" },
      "total_revenue": 45000000,
      "total_transactions": 120,
      "total_patients": 95
    },
    {
      "branch": { "id": 2, "name": "WSDC Cabang B", "code": "WSB" },
      "total_revenue": 38000000,
      "total_transactions": 98,
      "total_patients": 80
    }
  ]
}
```

---

## 8. Master Data

### 8.1 Branches

```
GET    /api/v1/branches        # [ALL] — daftar cabang aktif
POST   /api/v1/branches        # [OWNER] — tambah cabang
GET    /api/v1/branches/{id}   # [OWNER] — detail cabang
PUT    /api/v1/branches/{id}   # [OWNER] — update cabang
DELETE /api/v1/branches/{id}   # [OWNER] — nonaktifkan cabang (soft)
```

**POST/PUT Request Body:**
```json
{
  "name": "WSDC Cabang C",
  "code": "WSC",
  "address": "Jl. Sudirman No. 5, Bandung",
  "phone": "022-1234567",
  "is_active": true
}
```

**Validation Rules (POST):**
| Field | Rules |
|---|---|
| `name` | required, string, max:150 |
| `code` | required, string, max:20, unique:branches,code |
| `address` | required, string |
| `phone` | nullable, string, max:20 |
| `is_active` | boolean |

---

### 8.2 Treatment Masters

```
GET    /api/v1/treatment-masters            # [ALL] — daftar tindakan aktif (dengan filter branch_id)
POST   /api/v1/treatment-masters            # [OWNER] — tambah tindakan
GET    /api/v1/treatment-masters/{id}       # [OWNER] — detail tindakan
PUT    /api/v1/treatment-masters/{id}       # [OWNER] — update tindakan
DELETE /api/v1/treatment-masters/{id}       # [OWNER] — nonaktifkan
```

**GET Query Parameters:** `branch_id` (opsional, filter tarif per cabang), `search` (nama tindakan), `is_active` (default: true).

**POST/PUT Request Body:**
```json
{
  "name": "Tambal Gigi Komposit",
  "default_price": 200000,
  "branch_id": null,
  "is_active": true
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `name` | required, string, max:200 |
| `default_price` | required, numeric, min:0 |
| `branch_id` | nullable, integer, exists:branches,id |
| `is_active` | boolean |

---

### 8.3 Users (Manajemen Pengguna)

```
GET    /api/v1/users           # [OWNER] — daftar pengguna
POST   /api/v1/users           # [OWNER] — tambah pengguna
GET    /api/v1/users/{id}      # [OWNER] — detail pengguna
PUT    /api/v1/users/{id}      # [OWNER] — update pengguna
DELETE /api/v1/users/{id}      # [OWNER] — nonaktifkan pengguna
```

**POST/PUT Request Body:**
```json
{
  "name": "Siti Rahayu",
  "email": "siti@wsdc.id",
  "password": "rahasia123",
  "role_id": 1,
  "branch_id": 2,
  "is_active": true
}
```

**Validation Rules (POST):**
| Field | Rules |
|---|---|
| `name` | required, string, max:150 |
| `email` | required, email, unique:users,email, max:200 |
| `password` | required, string, min:8 |
| `role_id` | required, integer, exists:roles,id |
| `branch_id` | nullable, integer, exists:branches,id — nullable jika role = owner |
| `is_active` | boolean |

---

### 8.4 Roles

```
GET /api/v1/roles   # [OWNER] — daftar role untuk dropdown
```

**Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "id": 1, "name": "admin", "display_name": "Administrator" },
    { "id": 2, "name": "doctor", "display_name": "Dokter" },
    { "id": 3, "name": "owner", "display_name": "Owner" }
  ]
}
```

---

### 8.5 Odontogram Conditions

```
GET    /api/v1/odontogram-conditions         # [ALL] — daftar kondisi aktif
POST   /api/v1/odontogram-conditions         # [OWNER] — tambah kondisi
PUT    /api/v1/odontogram-conditions/{id}    # [OWNER] — update kondisi
DELETE /api/v1/odontogram-conditions/{id}    # [OWNER] — nonaktifkan
```

**GET Response 200:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "id": 1, "code": "healthy", "display_name": "Sehat", "symbol": null, "color": "#4CAF50" },
    { "id": 2, "code": "caries", "display_name": "Karies", "symbol": "C", "color": "#F44336" }
  ]
}
```

---

## 9. Dashboard Summary

### 9.1 Ringkasan Dashboard

```
GET /api/v1/dashboard/summary
```

**Permission:** `[ALL]`

Response disesuaikan berdasarkan role pengguna.

**Query Parameters:** `branch_id` (opsional, hanya Owner).

**Response 200 (Admin/Dokter):**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "today": {
      "appointments_count": 8,
      "patients_checked_in": 3,
      "patients_completed": 5,
      "revenue_today": 2500000
    },
    "recent_appointments": [
      {
        "id": 20,
        "patient_name": "Andi Wijaya",
        "appointment_time": "09:00",
        "status": "completed"
      }
    ]
  }
}
```

**Response 200 (Owner):**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "today": {
      "total_appointments": 24,
      "total_patients": 22,
      "total_revenue_today": 7500000
    },
    "revenue_trend_7days": [
      { "date": "2026-06-10", "revenue": 5500000 },
      { "date": "2026-06-11", "revenue": 6200000 }
    ],
    "branch_summary": [
      { "branch_name": "WSDC Cabang A", "appointments_today": 8, "revenue_today": 2500000 },
      { "branch_name": "WSDC Cabang B", "appointments_today": 10, "revenue_today": 3000000 }
    ]
  }
}
```

---

## 10. Catatan Umum

### 10.1 Pagination Standard

Semua endpoint list mendukung:
- `page` (integer, default: 1)
- `per_page` (integer, default: 15, maksimum: 100)

### 10.2 Branch Scope Otomatis

Seluruh endpoint list yang memiliki data terikat cabang secara otomatis memfilter data berdasarkan `branch_id` pengguna yang login (kecuali Owner). Parameter `branch_id` pada query string hanya efektif untuk Owner.

### 10.3 Soft Delete

Data yang di-"hapus" melalui API menggunakan soft delete (kolom `deleted_at`). Data soft-deleted tidak muncul pada endpoint list namun masih dapat diakses untuk kebutuhan audit jika diperlukan endpoint khusus.

### 10.4 Timestamp Format

Seluruh timestamp menggunakan format ISO 8601 dengan timezone: `YYYY-MM-DDTHH:MM:SSZ` (UTC). Frontend bertanggung jawab mengkonversi ke timezone lokal (WIB = UTC+7) untuk tampilan.

### 10.5 Ekspor Data (Pending Konfirmasi)

Endpoint laporan dapat ditambahkan parameter `?export=excel` atau `?export=pdf` untuk mengembalikan file ekspor. Implementasi menggunakan `maatwebsite/laravel-excel` (Excel) dan `barryvdh/laravel-dompdf` (PDF). Fitur ini menunggu konfirmasi client (lihat gap-analysis.md MR-05).

---

*Dokumen ini menjadi kontrak antara frontend dan backend developer. Setiap perubahan endpoint, request body, atau response structure harus didokumentasikan di sini dan dikomunikasikan ke seluruh tim sebelum implementasi.*
