import { apiClient } from "./client"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type {
  Patient,
  PatientFormData,
  PatientHistoryItem,
  PatientListItem,
} from "@/types/patient"
import type { MedicalRecordListItem } from "@/types/medical-record"
import type { Payment } from "@/types/payment"

export interface PatientListParams {
  search?: string
  branch_id?: number
  page?: number
  per_page?: number
}

export const patientsApi = {
  list: async (params: PatientListParams = {}): Promise<PaginatedResponse<PatientListItem>> => {
    const { data } = await apiClient.get<PaginatedResponse<PatientListItem>>("/patients", { params })
    return data
  },

  get: async (id: number): Promise<Patient> => {
    const { data } = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`)
    return data.data
  },

  create: async (payload: PatientFormData): Promise<Patient> => {
    const { data } = await apiClient.post<ApiResponse<Patient>>("/patients", payload)
    return data.data
  },

  update: async (id: number, payload: PatientFormData): Promise<Patient> => {
    const { data } = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, payload)
    return data.data
  },

  history: async (id: number): Promise<PatientHistoryItem[]> => {
    const { data } = await apiClient.get<ApiResponse<PatientHistoryItem[]>>(`/patients/${id}/history`)
    return data.data
  },

  medicalRecords: async (id: number): Promise<MedicalRecordListItem[]> => {
    const { data } = await apiClient.get<ApiResponse<MedicalRecordListItem[]>>(
      `/patients/${id}/medical-records`,
    )
    return data.data
  },

  payments: async (id: number): Promise<Payment[]> => {
    const { data } = await apiClient.get<ApiResponse<Payment[]>>(`/patients/${id}/payments`)
    return data.data
  },
}
