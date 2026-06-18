import { NavLink, Outlet } from "react-router-dom"
import { LogOut } from "lucide-react"
import { NAV_ITEMS } from "@/config/navigation"
import { ROLE_LABELS } from "@/constants/roles"
import { useAuthStore } from "@/stores/auth-store"
import { useLogout } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export default function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  const items = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role.name))

  return (
    <div className="flex min-h-svh">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center border-b px-6 font-semibold">WSDC Klinik</div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Konten */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="text-sm text-muted-foreground">
            {user?.branch ? user.branch.name : "Semua Cabang"}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">
                {user ? ROLE_LABELS[user.role.name] : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              <LogOut className="size-4" />
              Keluar
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
