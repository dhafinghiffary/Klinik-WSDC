export type PhotoType = "intraoral" | "extraoral" | "xray" | "other"

export interface Diagnosis {
  id?: number
  tooth_number: string | null
  description: string
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
  instruction: string
}

export interface Odontogram {
  id?: number
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
  diagnoses: Diagnosis[]
  treatments: Treatment[]
  prescriptions: Prescription[]
  odontograms: Odontogram[]
  photos: PatientPhoto[]
  created_at: string
  updated_at: string
}

/** Payload aggregate untuk create/update rekam medis. */
export interface MedicalRecordFormData {
  patient_id: number
  appointment_id?: number | null
  visit_date: string
  anamnesis?: string | null
  diagnoses: Diagnosis[]
  treatments: Treatment[]
  prescriptions: Prescription[]
  odontograms: Odontogram[]
}
