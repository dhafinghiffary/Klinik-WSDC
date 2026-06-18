import { apiClient } from "./client"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type { Appointment, AppointmentFormData, AppointmentStatus } from "@/types/appointment"

export interface AppointmentListParams {
  date?: string
  doctor_id?: number
  status?: AppointmentStatus
  page?: number
  per_page?: number
}

export const appointmentsApi = {
  list: async (params: AppointmentListParams = {}): Promise<PaginatedResponse<Appointment>> => {
    const { data } = await apiClient.get<PaginatedResponse<Appointment>>("/appointments", { params })
    return data
  },

  today: async (): Promise<Appointment[]> => {
    const { data } = await apiClient.get<ApiResponse<Appointment[]>>("/appointments/today")
    return data.data
  },

  get: async (id: number): Promise<Appointment> => {
    const { data } = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`)
    return data.data
  },

  create: async (payload: AppointmentFormData): Promise<Appointment> => {
    const { data } = await apiClient.post<ApiResponse<Appointment>>("/appointments", payload)
    return data.data
  },

  updateStatus: async (id: number, status: AppointmentStatus): Promise<Appointment> => {
    const { data } = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, {
      status,
    })
    return data.data
  },
}
