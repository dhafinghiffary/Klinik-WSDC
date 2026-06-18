import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"
import type { RoleName } from "@/types/auth"

interface ProtectedRouteProps {
  /** Jika diisi, hanya role tersebut yang boleh mengakses. */
  roles?: RoleName[]
}

/**
 * Guard route:
 * - Belum login  -> redirect /login
 * - Role tak sesuai -> redirect /403
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role.name)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
