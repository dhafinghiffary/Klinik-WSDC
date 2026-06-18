import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react"
import type { RoleName } from "@/types/auth"

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  roles: RoleName[]
}

/** Item sidebar. Ditampilkan sesuai role user yang login. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "owner"] },
  { label: "Pasien", to: "/patients", icon: Users, roles: ["admin", "owner"] },
  { label: "Janji Temu", to: "/appointments", icon: CalendarDays, roles: ["admin", "doctor"] },
  { label: "Pembayaran", to: "/payments", icon: Wallet, roles: ["admin", "owner"] },
  { label: "Laporan", to: "/reports", icon: BarChart3, roles: ["owner"] },
  { label: "Pengaturan", to: "/settings", icon: Settings, roles: ["owner"] },
]
