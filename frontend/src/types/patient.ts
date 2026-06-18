import type { Branch } from "./auth"

export type Gender = "male" | "female"

/** Item ringkas pada list pasien. */
export interface PatientListItem {
  id: number
  medical_record_number: string
  name: string
  birth_date: string
  age: number
  gender: Gender
  phone_number: string
  home_branch: Branch
  created_at: string
}

export interface PatientStats {
  total_visits: number
  last_visit_at: string | null
  total_spent: number
}

/** Detail lengkap pasien. */
export interface Patient {
  id: number
  medical_record_number: string
  name: string
  nik: string | null
  birth_place: string
  birth_date: string
  age: number
  gender: Gender
  address: string
  phone_number: string
  occupation: string | null
  guardian_name: string | null
  guardian_phone: string | null
  guardian_relation: string | null
  drug_allergies: string | null
  systemic_conditions: string | null
  home_branch: Branch
  stats?: PatientStats
  created_at: string
  updated_at: string
}

/** Payload create/update pasien. */
export interface PatientFormData {
  name: string
  nik?: string | null
  birth_place: string
  birth_date: string
  gender: Gender
  address: string
  phone_number: string
  occupation?: string | null
  guardian_name?: string | null
  guardian_phone?: string | null
  guardian_relation?: string | null
  drug_allergies?: string | null
  systemic_conditions?: string | null
  home_branch_id?: number
}
