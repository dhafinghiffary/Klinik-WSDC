import { apiClient } from "./client"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type { Patient, PatientFormData, PatientListItem } from "@/types/patient"

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
}
