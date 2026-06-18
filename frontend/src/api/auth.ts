import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { LoginRequest, LoginResponse, User } from "@/types/auth"

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>("/login", payload)
    return data.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/logout")
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>("/me")
    return data.data
  },

  changePassword: async (payload: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<void> => {
    await apiClient.put("/me/password", payload)
  },
}
