import { useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { LogOut, Menu, Stethoscope, User as UserIcon, X } from "lucide-react"
import { NAV_ITEMS } from "@/config/navigation"
import { ROLE_LABELS } from "@/constants/roles"
import { useAuthStore } from "@/stores/auth-store"
import { useLogout } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export default function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const [mobileOpen, setMobileOpen] = useState(false)

  const items = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role.name))

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
            )
          }
        >
          <item.icon className="size-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  const brand = (
    <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Stethoscope className="size-4" />
      </span>
      WSDC Klinik
    </div>
  )

  return (
    <div className="flex min-h-svh">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex print:hidden">
        {brand}
        {nav}
      </aside>

      {/* Sidebar mobile (drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="flex items-center justify-between border-b pr-2">
              {brand}
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
                <X className="size-5" />
              </Button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b px-4 md:px-6 print:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <Menu className="size-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {user?.branch ? user.branch.name : "Semua Cabang"}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
                <Avatar className="size-8">
                  <AvatarFallback>{user ? initials(user.name) : "?"}</AvatarFallback>
                </Avatar>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-tight">{user?.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {user ? ROLE_LABELS[user.role.name] : ""}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserIcon className="size-4" /> Profil Akun
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout.mutate()} variant="destructive">
                <LogOut className="size-4" /> Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
