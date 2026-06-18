import axios from "axios"
import type { AxiosError } from "axios"
import { useAuthStore } from "@/stores/auth-store"
import type { ApiErrorBody } from "@/types/api"

/** Instance axios tunggal untuk seluruh aplikasi. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

// Inject Bearer token dari auth store ke setiap request.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Tangani 401 secara global: bersihkan sesi & arahkan ke halaman login.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

/** Ambil pesan error yang ramah dari response API. */
export function getApiErrorMessage(error: unknown, fallback = "Terjadi kesalahan."): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as ApiErrorBody | undefined)?.message ?? fallback
  }
  return fallback
}
