import { apiClient } from "./client"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type { Payment, PaymentFormData, PaymentMethod } from "@/types/payment"

export interface PaymentListParams {
  date_from?: string
  date_to?: string
  payment_method?: PaymentMethod
  page?: number
  per_page?: number
}

export const paymentsApi = {
  list: async (params: PaymentListParams = {}): Promise<PaginatedResponse<Payment>> => {
    const { data } = await apiClient.get<PaginatedResponse<Payment>>("/payments", { params })
    return data
  },

  get: async (id: number): Promise<Payment> => {
    const { data } = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`)
    return data.data
  },

  create: async (payload: PaymentFormData): Promise<Payment> => {
    const { data } = await apiClient.post<ApiResponse<Payment>>("/payments", payload)
    return data.data
  },
}
