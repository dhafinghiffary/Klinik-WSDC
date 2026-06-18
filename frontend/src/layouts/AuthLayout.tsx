import { Outlet } from "react-router-dom"

export default function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4">
      <Outlet />
    </div>
  )
}
