import type { RoleName } from "@/types/auth"

/** Konstanta nama role (sesuai seeding backend). */
export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  OWNER: "owner",
} as const

/** Label tampilan bahasa Indonesia per role. */
export const ROLE_LABELS: Record<RoleName, string> = {
  admin: "Administrator",
  doctor: "Dokter",
  owner: "Owner",
}
