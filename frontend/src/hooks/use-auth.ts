import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { authApi } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { useAuthStore } from "@/stores/auth-store"
import type { LoginRequest } from "@/types/auth"

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      toast.success("Login berhasil.")
      navigate("/dashboard", { replace: true })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Login gagal."))
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useMutation({
    mutationFn: () => authApi.logout(),
    // Bersihkan sesi apa pun hasil request logout-nya.
    onSettled: () => {
      clearAuth()
      navigate("/login", { replace: true })
    },
  })
}
