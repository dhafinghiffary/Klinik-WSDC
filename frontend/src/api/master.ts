import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { Branch, Role } from "@/types/auth"

export interface TreatmentMaster {
  id: number
  code: string
  name: string
  price: number
  is_active: boolean
}

export interface Doctor {
  id: number
  name: string
  specialization: string | null
  license_number: string | null
  is_active: boolean
}

export interface OdontogramCondition {
  id: number
  code: string
  name: string
  color: string | null
}

/** Endpoint master data (Settings & dropdown referensi). */
export const masterApi = {
  branches: async (): Promise<Branch[]> => {
    const { data } = await apiClient.get<ApiResponse<Branch[]>>("/branches")
    return data.data
  },

  roles: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<ApiResponse<Role[]>>("/roles")
    return data.data
  },

  doctors: async (params: { branch_id?: number } = {}): Promise<Doctor[]> => {
    const { data } = await apiClient.get<ApiResponse<Doctor[]>>("/doctors", { params })
    return data.data
  },

  treatments: async (): Promise<TreatmentMaster[]> => {
    const { data } = await apiClient.get<ApiResponse<TreatmentMaster[]>>("/treatment-masters")
    return data.data
  },

  odontogramConditions: async (): Promise<OdontogramCondition[]> => {
    const { data } = await apiClient.get<ApiResponse<OdontogramCondition[]>>("/odontogram-conditions")
    return data.data
  },
}
