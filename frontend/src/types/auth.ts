export type RoleName = "admin" | "doctor" | "owner"

export interface Role {
  id: number
  name: RoleName
  display_name: string
}

export interface Branch {
  id: number
  name: string
  code: string
}

export interface User {
  id: number
  name: string
  email: string
  role: Role
  branch: Branch | null
  is_active: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}
