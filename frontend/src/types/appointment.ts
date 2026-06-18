export type AppointmentStatus =
  | "scheduled"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"

export interface AppointmentPatientRef {
  id: number
  name: string
  medical_record_number: string
  phone_number: string
}

export interface Appointment {
  id: number
  scheduled_at: string
  status: AppointmentStatus
  notes: string | null
  patient: AppointmentPatientRef
  doctor: { id: number; name: string }
  branch: { id: number; name: string }
  created_at: string
}

export interface AppointmentFormData {
  patient_id: number
  doctor_id: number
  branch_id: number
  scheduled_at: string
  notes?: string | null
}
