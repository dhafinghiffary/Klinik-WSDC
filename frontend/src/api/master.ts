import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { Branch, Role } from "@/types/auth"

// ── Tipe entitas master ──────────────────────────────────
export interface BranchDetail extends Branch {
  address: string | null
  phone: string | null
  is_active: boolean
}

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

// ── Read helpers (dropdown & lintas halaman) ─────────────
export const masterApi = {
  branches: async (): Promise<BranchDetail[]> =>
    (await apiClient.get<ApiResponse<BranchDetail[]>>("/branches")).data.data,
  roles: async (): Promise<Role[]> =>
    (await apiClient.get<ApiResponse<Role[]>>("/roles")).data.data,
  doctors: async (params: { branch_id?: number } = {}): Promise<Doctor[]> =>
    (await apiClient.get<ApiResponse<Doctor[]>>("/doctors", { params })).data.data,
  treatments: async (): Promise<TreatmentMaster[]> =>
    (await apiClient.get<ApiResponse<TreatmentMaster[]>>("/treatment-masters")).data.data,
  odontogramConditions: async (): Promise<OdontogramCondition[]> =>
    (await apiClient.get<ApiResponse<OdontogramCondition[]>>("/odontogram-conditions")).data.data,
}

// ── CRUD master data (Settings) ──────────────────────────
export interface BranchFormData {
  name: string
  code: string
  address?: string | null
  phone?: string | null
}
export const branchesApi = {
  create: async (p: BranchFormData) =>
    (await apiClient.post<ApiResponse<BranchDetail>>("/branches", p)).data.data,
  update: async (id: number, p: BranchFormData) =>
    (await apiClient.put<ApiResponse<BranchDetail>>(`/branches/${id}`, p)).data.data,
  remove: async (id: number) => {
    await apiClient.delete(`/branches/${id}`)
  },
}

export interface TreatmentFormData {
  name: string
  price: number
}
export const treatmentsApi = {
  create: async (p: TreatmentFormData) =>
    (await apiClient.post<ApiResponse<TreatmentMaster>>("/treatment-masters", p)).data.data,
  update: async (id: number, p: TreatmentFormData) =>
    (await apiClient.put<ApiResponse<TreatmentMaster>>(`/treatment-masters/${id}`, p)).data.data,
  remove: async (id: number) => {
    await apiClient.delete(`/treatment-masters/${id}`)
  },
}

export interface DoctorFormData {
  name: string
  specialization?: string | null
  license_number?: string | null
}
export const doctorsApi = {
  create: async (p: DoctorFormData) =>
    (await apiClient.post<ApiResponse<Doctor>>("/doctors", p)).data.data,
  update: async (id: number, p: DoctorFormData) =>
    (await apiClient.put<ApiResponse<Doctor>>(`/doctors/${id}`, p)).data.data,
  remove: async (id: number) => {
    await apiClient.delete(`/doctors/${id}`)
  },
}

export interface ConditionFormData {
  name: string
  color: string
}
export const conditionsApi = {
  create: async (p: ConditionFormData) =>
    (await apiClient.post<ApiResponse<OdontogramCondition>>("/odontogram-conditions", p)).data.data,
  update: async (id: number, p: ConditionFormData) =>
    (await apiClient.put<ApiResponse<OdontogramCondition>>(`/odontogram-conditions/${id}`, p)).data
      .data,
  remove: async (id: number) => {
    await apiClient.delete(`/odontogram-conditions/${id}`)
  },
}
