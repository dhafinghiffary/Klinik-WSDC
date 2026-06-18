import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { ManagedUser, UserFormData } from "@/types/user"

export const usersApi = {
  list: async (): Promise<ManagedUser[]> => {
    const { data } = await apiClient.get<ApiResponse<ManagedUser[]>>("/users")
    return data.data
  },

  create: async (payload: UserFormData): Promise<ManagedUser> => {
    const { data } = await apiClient.post<ApiResponse<ManagedUser>>("/users", payload)
    return data.data
  },

  update: async (id: number, payload: UserFormData): Promise<ManagedUser> => {
    const { data } = await apiClient.put<ApiResponse<ManagedUser>>(`/users/${id}`, payload)
    return data.data
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}
