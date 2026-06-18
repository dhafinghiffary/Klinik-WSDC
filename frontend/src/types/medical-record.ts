export type PhotoType = "intraoral" | "extraoral" | "xray" | "other"

export interface Diagnosis {
  id?: number
  tooth_number: string | null
  description: string
  notes: string | null
}

export interface Treatment {
  id?: number
  treatment_master_id: number | null
  name: string
  tooth_number: string | null
  price: number
  notes: string | null
}

export interface Prescription {
  id?: number
  medicine_name: string
  dosage: string
  frequency: string
  quantity: string
  instruction: string | null
}

export interface Odontogram {
  tooth_number: string
  condition_code: string
  notes: string | null
}

export interface PatientPhoto {
  id: number
  url: string
  type: PhotoType
  caption: string | null
  created_at: string
}

export interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  branch_id: number
  visit_date: string
  anamnesis: string | null
  additional_notes: string | null
  diagnoses: Diagnosis[]
  treatments: Treatment[]
  prescriptions: Prescription[]
  odontograms: Odontogram[]
  photos: PatientPhoto[]
  created_at: string
  updated_at: string
  // Field tampilan
  patient?: { id: number; name: string; medical_record_number: string; drug_allergies: string | null }
  doctor_name?: string | null
  branch_name?: string | null
  has_payment?: boolean
}

/** Ringkasan untuk tabel rekam medis di Detail Pasien. */
export interface MedicalRecordListItem {
  id: number
  visit_date: string
  doctor_name: string
  diagnosis_summary: string
  treatment_count: number
  payment_status: "paid" | "partial" | "unpaid" | null
}

/** Payload aggregate untuk create/update rekam medis. */
export interface MedicalRecordFormData {
  patient_id: number
  appointment_id?: number | null
  visit_date: string
  anamnesis: string
  additional_notes?: string | null
  diagnoses: Diagnosis[]
  treatments: Treatment[]
  prescriptions: Prescription[]
  odontograms: Odontogram[]
}
