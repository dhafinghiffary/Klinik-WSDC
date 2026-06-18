import type { Role, User } from "@/types/auth"
import type { Patient } from "@/types/patient"
import type { BranchDetail, Doctor, OdontogramCondition, TreatmentMaster } from "@/api/master"
import type { ManagedUser } from "@/types/user"
import type { MedicalRecord } from "@/types/medical-record"
import type { Payment } from "@/types/payment"

// ── Roles ────────────────────────────────────────────────
export const roleAdmin: Role = { id: 1, name: "admin", display_name: "Administrator" }
export const roleDoctor: Role = { id: 2, name: "doctor", display_name: "Dokter" }
export const roleOwner: Role = { id: 3, name: "owner", display_name: "Owner" }
export const roles: Role[] = [roleAdmin, roleDoctor, roleOwner]

// ── Cabang ───────────────────────────────────────────────
export const branches: BranchDetail[] = [
  { id: 1, name: "WSDC Cabang A", code: "WSA", address: "Jl. Merdeka No. 1, Bandung", phone: "022-1111111", is_active: true },
  { id: 2, name: "WSDC Cabang B", code: "WSB", address: "Jl. Diponegoro No. 2, Bandung", phone: "022-2222222", is_active: true },
  { id: 3, name: "WSDC Cabang C", code: "WSC", address: "Jl. Asia Afrika No. 3, Bandung", phone: "022-3333333", is_active: true },
]

// ── Dokter ───────────────────────────────────────────────
export const doctors: Doctor[] = [
  { id: 3, name: "drg. Budi Santoso", specialization: "Umum", license_number: "STR-001", is_active: true },
  { id: 4, name: "drg. Citra Dewi", specialization: "Ortodonti", license_number: "STR-002", is_active: true },
  { id: 5, name: "drg. Ayu Pratiwi", specialization: "Bedah Mulut", license_number: "STR-003", is_active: true },
]

// ── Master Tindakan ──────────────────────────────────────
export const treatmentMasters: TreatmentMaster[] = [
  { id: 1, code: "TKN-001", name: "Konsultasi", price: 50000, is_active: true },
  { id: 2, code: "TKN-002", name: "Scaling (Pembersihan Karang)", price: 250000, is_active: true },
  { id: 3, code: "TKN-003", name: "Tambal Gigi Komposit", price: 300000, is_active: true },
  { id: 4, code: "TKN-004", name: "Cabut Gigi", price: 200000, is_active: true },
  { id: 5, code: "TKN-005", name: "Perawatan Saluran Akar", price: 750000, is_active: true },
  { id: 6, code: "TKN-006", name: "Pemasangan Behel", price: 5000000, is_active: true },
]

// ── Kondisi Odontogram ───────────────────────────────────
export const odontogramConditions: OdontogramCondition[] = [
  { id: 1, code: "CAR", name: "Karies", color: "#ef4444" },
  { id: 2, code: "TAM", name: "Tambalan", color: "#3b82f6" },
  { id: 3, code: "MIS", name: "Gigi Hilang", color: "#6b7280" },
  { id: 4, code: "CRN", name: "Crown / Mahkota", color: "#f59e0b" },
  { id: 5, code: "IMP", name: "Implan", color: "#8b5cf6" },
]

// ── Akun demo (password semua: "password") ───────────────
export interface MockAccount {
  password: string
  token: string
  user: User
}

export const accounts: Record<string, MockAccount> = {
  "owner@wsdc.test": {
    password: "password",
    token: "mock-token-owner",
    user: { id: 1, name: "Pak Widya", email: "owner@wsdc.test", role: roleOwner, branch: null, is_active: true },
  },
  "admin@wsdc.test": {
    password: "password",
    token: "mock-token-admin",
    user: { id: 2, name: "Siti Rahayu", email: "admin@wsdc.test", role: roleAdmin, branch: branches[0], is_active: true },
  },
  "dokter@wsdc.test": {
    password: "password",
    token: "mock-token-doctor",
    user: { id: 3, name: "drg. Budi Santoso", email: "dokter@wsdc.test", role: roleDoctor, branch: branches[0], is_active: true },
  },
}

export const accountByToken: Record<string, MockAccount> = Object.fromEntries(
  Object.values(accounts).map((a) => [a.token, a]),
)

export function accountFromRequest(request: Request): MockAccount | undefined {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "")
  return token ? accountByToken[token] : undefined
}

// ── Pengguna (manajemen di Settings) ─────────────────────
export const managedUsers: ManagedUser[] = [
  { id: 1, name: "Pak Widya", email: "owner@wsdc.test", role: roleOwner, branch: null, is_active: true },
  { id: 2, name: "Siti Rahayu", email: "admin@wsdc.test", role: roleAdmin, branch: branches[0], is_active: true },
  { id: 3, name: "drg. Budi Santoso", email: "dokter@wsdc.test", role: roleDoctor, branch: branches[0], is_active: true },
  { id: 4, name: "Rina Marlina", email: "rina@wsdc.test", role: roleAdmin, branch: branches[1], is_active: true },
  { id: 5, name: "drg. Citra Dewi", email: "citra@wsdc.test", role: roleDoctor, branch: branches[1], is_active: false },
]

// ── Pasien ───────────────────────────────────────────────
export const patients: Patient[] = [
  {
    id: 1, medical_record_number: "WSA-2026-000001", name: "Andi Wijaya", nik: "3201234567890001",
    birth_place: "Bandung", birth_date: "1990-05-20", age: 36, gender: "male",
    address: "Jl. Merdeka No. 10, Bandung", phone_number: "081234567001", occupation: "Karyawan Swasta",
    guardian_name: null, guardian_phone: null, guardian_relation: null,
    drug_allergies: "Penisilin", systemic_conditions: "Tidak ada",
    home_branch: branches[0], stats: { total_visits: 5, last_visit_at: "2026-05-12T09:00:00Z", total_spent: 1850000 },
    created_at: "2026-01-10T08:00:00Z", updated_at: "2026-05-12T09:00:00Z",
  },
  {
    id: 2, medical_record_number: "WSA-2026-000002", name: "Dewi Lestari", nik: "3201234567890002",
    birth_place: "Jakarta", birth_date: "1995-11-02", age: 30, gender: "female",
    address: "Jl. Sudirman No. 5, Jakarta", phone_number: "081234567002", occupation: "Guru",
    guardian_name: null, guardian_phone: null, guardian_relation: null,
    drug_allergies: null, systemic_conditions: "Hipertensi",
    home_branch: branches[0], stats: { total_visits: 2, last_visit_at: "2026-04-01T10:30:00Z", total_spent: 450000 },
    created_at: "2026-02-14T08:00:00Z", updated_at: "2026-04-01T10:30:00Z",
  },
  {
    id: 3, medical_record_number: "WSB-2026-000003", name: "Rizky Pratama", nik: null,
    birth_place: "Surabaya", birth_date: "2012-03-15", age: 14, gender: "male",
    address: "Jl. Pemuda No. 22, Surabaya", phone_number: "081234567003", occupation: null,
    guardian_name: "Bambang Pratama", guardian_phone: "081234567013", guardian_relation: "Ayah",
    drug_allergies: null, systemic_conditions: null,
    home_branch: branches[1], stats: { total_visits: 1, last_visit_at: "2026-06-01T13:00:00Z", total_spent: 200000 },
    created_at: "2026-06-01T08:00:00Z", updated_at: "2026-06-01T13:00:00Z",
  },
  {
    id: 4, medical_record_number: "WSA-2026-000004", name: "Maya Sari", nik: "3201234567890004",
    birth_place: "Bandung", birth_date: "1988-07-30", age: 37, gender: "female",
    address: "Jl. Asia Afrika No. 88, Bandung", phone_number: "081234567004", occupation: "Wiraswasta",
    guardian_name: null, guardian_phone: null, guardian_relation: null,
    drug_allergies: "Sulfa", systemic_conditions: "Diabetes",
    home_branch: branches[0], stats: { total_visits: 8, last_visit_at: "2026-06-10T11:00:00Z", total_spent: 3200000 },
    created_at: "2025-11-20T08:00:00Z", updated_at: "2026-06-10T11:00:00Z",
  },
  {
    id: 5, medical_record_number: "WSB-2026-000005", name: "Joko Susilo", nik: "3201234567890005",
    birth_place: "Yogyakarta", birth_date: "1975-01-12", age: 51, gender: "male",
    address: "Jl. Malioboro No. 1, Yogyakarta", phone_number: "081234567005", occupation: "PNS",
    guardian_name: null, guardian_phone: null, guardian_relation: null,
    drug_allergies: null, systemic_conditions: null,
    home_branch: branches[1], stats: { total_visits: 3, last_visit_at: "2026-03-22T14:00:00Z", total_spent: 950000 },
    created_at: "2026-01-05T08:00:00Z", updated_at: "2026-03-22T14:00:00Z",
  },
  {
    id: 6, medical_record_number: "WSC-2026-000006", name: "Putri Anggraini", nik: "3201234567890006",
    birth_place: "Semarang", birth_date: "2000-09-25", age: 25, gender: "female",
    address: "Jl. Pandanaran No. 17, Semarang", phone_number: "081234567006", occupation: "Mahasiswa",
    guardian_name: null, guardian_phone: null, guardian_relation: null,
    drug_allergies: null, systemic_conditions: null,
    home_branch: branches[2], stats: { total_visits: 1, last_visit_at: "2026-06-15T09:30:00Z", total_spent: 150000 },
    created_at: "2026-06-15T08:00:00Z", updated_at: "2026-06-15T09:30:00Z",
  },
]

// ── Rekam Medis ──────────────────────────────────────────
export const medicalRecords: MedicalRecord[] = [
  {
    id: 1, patient_id: 1, doctor_id: 3, branch_id: 1, visit_date: "2026-05-12",
    anamnesis: "Pasien mengeluh nyeri pada gigi geraham kanan bawah sejak 3 hari lalu.",
    additional_notes: "Pasien diminta kontrol 1 minggu lagi.",
    diagnoses: [{ tooth_number: "46", description: "Karies Dentin", notes: null }],
    treatments: [
      { treatment_master_id: 3, name: "Tambal Gigi Komposit", tooth_number: "46", price: 300000, notes: null },
      { treatment_master_id: 1, name: "Konsultasi", tooth_number: null, price: 50000, notes: null },
    ],
    prescriptions: [
      { medicine_name: "Amoksisilin 500mg", dosage: "500mg", frequency: "3x1", quantity: "10 tablet", instruction: "Setelah makan" },
      { medicine_name: "Paracetamol 500mg", dosage: "500mg", frequency: "3x1 bila nyeri", quantity: "10 tablet", instruction: null },
    ],
    odontograms: [{ tooth_number: "46", condition_code: "TAM", notes: "Tambalan komposit" }],
    photos: [],
    created_at: "2026-05-12T09:00:00Z", updated_at: "2026-05-12T09:00:00Z",
    patient: { id: 1, name: "Andi Wijaya", medical_record_number: "WSA-2026-000001", drug_allergies: "Penisilin" },
    doctor_name: "drg. Budi Santoso", branch_name: "WSDC Cabang A", has_payment: true,
  },
  {
    id: 2, patient_id: 4, doctor_id: 3, branch_id: 1, visit_date: "2026-06-10",
    anamnesis: "Kontrol rutin dan pembersihan karang gigi.",
    additional_notes: null,
    diagnoses: [{ tooth_number: null, description: "Kalkulus supragingiva", notes: null }],
    treatments: [
      { treatment_master_id: 2, name: "Scaling (Pembersihan Karang)", tooth_number: null, price: 250000, notes: null },
    ],
    prescriptions: [],
    odontograms: [],
    photos: [],
    created_at: "2026-06-10T11:00:00Z", updated_at: "2026-06-10T11:00:00Z",
    patient: { id: 4, name: "Maya Sari", medical_record_number: "WSA-2026-000004", drug_allergies: "Sulfa" },
    doctor_name: "drg. Budi Santoso", branch_name: "WSDC Cabang A", has_payment: false,
  },
]

// ── Pembayaran ───────────────────────────────────────────
export const payments: Payment[] = [
  {
    id: 1, invoice_number: "INV-WSA-202605-0001", patient_id: 1, branch_id: 1, doctor_id: 3, medical_record_id: 1,
    subtotal: 350000, discount_type: null, discount_value: 0, total: 350000, paid_amount: 350000, change_amount: 0,
    payment_method: "cash", status: "paid",
    details: [
      { treatment_master_id: 3, name: "Tambal Gigi Komposit", price: 300000, quantity: 1, subtotal: 300000 },
      { treatment_master_id: 1, name: "Konsultasi", price: 50000, quantity: 1, subtotal: 50000 },
    ],
    paid_at: "2026-05-12T09:30:00Z", created_at: "2026-05-12T09:30:00Z",
    patient: { id: 1, name: "Andi Wijaya", medical_record_number: "WSA-2026-000001" },
    doctor_name: "drg. Budi Santoso", branch_name: "WSDC Cabang A", visit_date: "2026-05-12",
  },
  {
    id: 2, invoice_number: "INV-WSA-202604-0002", patient_id: 2, branch_id: 1, doctor_id: 4, medical_record_id: null,
    subtotal: 50000, discount_type: null, discount_value: 0, total: 50000, paid_amount: 50000, change_amount: 0,
    payment_method: "transfer", status: "paid",
    details: [{ treatment_master_id: 1, name: "Konsultasi", price: 50000, quantity: 1, subtotal: 50000 }],
    paid_at: "2026-04-01T10:45:00Z", created_at: "2026-04-01T10:45:00Z",
    patient: { id: 2, name: "Dewi Lestari", medical_record_number: "WSA-2026-000002" },
    doctor_name: "drg. Citra Dewi", branch_name: "WSDC Cabang A", visit_date: "2026-04-01",
  },
]

// ── Helper ID berikutnya ─────────────────────────────────
export function nextId(items: { id: number }[]): number {
  return items.reduce((max, i) => Math.max(max, i.id), 0) + 1
}
