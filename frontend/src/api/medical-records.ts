import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { MedicalRecord, MedicalRecordFormData } from "@/types/medical-record"

export const medicalRecordsApi = {
  get: async (id: number): Promise<MedicalRecord> => {
    const { data } = await apiClient.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`)
    return data.data
  },

  create: async (payload: MedicalRecordFormData): Promise<MedicalRecord> => {
    const { data } = await apiClient.post<ApiResponse<MedicalRecord>>("/medical-records", payload)
    return data.data
  },

  update: async (id: number, payload: MedicalRecordFormData): Promise<MedicalRecord> => {
    const { data } = await apiClient.put<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, payload)
    return data.data
  },

  uploadPhoto: async (id: number, formData: FormData): Promise<void> => {
    await apiClient.post(`/medical-records/${id}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}
