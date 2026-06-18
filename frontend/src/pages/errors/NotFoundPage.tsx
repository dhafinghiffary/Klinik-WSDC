import { Link } from "react-router-dom"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-center">
      <p className="text-5xl font-bold">404</p>
      <p className="text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link to="/dashboard" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        Kembali ke Dashboard
      </Link>
    </div>
  )
}
