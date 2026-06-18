import type { Branch, Role } from "./auth"

export interface ManagedUser {
  id: number
  name: string
  email: string
  role: Role
  branch: Branch | null
  is_active: boolean
}

export interface UserFormData {
  name: string
  email: string
  password?: string
  role_id: number
  branch_id: number | null
}
