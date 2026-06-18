import { Link } from "react-router-dom"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Users,
  Wallet,
  Stethoscope,
  UserPlus,
  CalendarPlus,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { useTodayAppointments } from "@/hooks/use-appointments"
import { useAuthStore } from "@/stores/auth-store"
import { StatCard } from "@/components/shared/StatCard"
import { AppointmentStatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatIDR } from "@/utils/currency"
import { formatDate } from "@/utils/date"

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role.name
  const { data: summary, isLoading } = useDashboardSummary()
  const { data: appointments } = useTodayAppointments()

  const title =
    role === "doctor"
      ? `Selamat datang, ${user?.name}`
      : role === "owner"
        ? "Dashboard"
        : `Dashboard — ${user?.branch?.name ?? ""}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">Ringkasan aktivitas klinik hari ini, {formatDate(new Date())}</p>
      </div>

      {/* Stat cards */}
      {isLoading || !summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {role === "doctor" ? (
            <>
              <StatCard label="Menunggu" value={summary.waiting} icon={Clock} />
              <StatCard label="Sedang Diperiksa" value={summary.in_progress} icon={Stethoscope} />
              <StatCard label="Selesai Hari Ini" value={summary.completed} icon={CheckCircle2} />
              <StatCard label="Total Hari Ini" value={summary.today_appointments} icon={CalendarDays} />
            </>
          ) : (
            <>
              <StatCard label="Appointment Hari Ini" value={summary.today_appointments} icon={CalendarDays} />
              <StatCard label="Pasien Hari Ini" value={summary.today_patients} icon={Users} />
              <StatCard label="Pendapatan Hari Ini" value={formatIDR(summary.today_revenue)} icon={Wallet} />
              <StatCard label="Selesai Hari Ini" value={summary.completed} icon={CheckCircle2} />
            </>
          )}
        </div>
      )}

      {/* Admin quick actions */}
      {role === "admin" && (
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/patients/create">
              <UserPlus className="size-4" /> Pasien Baru
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/appointments/create">
              <CalendarPlus className="size-4" /> Booking Appointment
            </Link>
          </Button>
        </div>
      )}

      {/* Owner: revenue chart */}
      {role === "owner" && summary && (
        <Card>
          <CardHeader>
            <CardTitle>Tren Pendapatan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={summary.revenue_series} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Number(v) / 1_000_000} jt`}
                />
                <Tooltip formatter={(v) => formatIDR(Number(v))} />
                <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Owner: branch performance */}
      {role === "owner" && summary && summary.branch_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performa Cabang Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cabang</TableHead>
                  <TableHead className="text-right">Appointment</TableHead>
                  <TableHead className="text-right">Pendapatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.branch_performance.map((b) => (
                  <TableRow key={b.branch}>
                    <TableCell className="font-medium">{b.branch}</TableCell>
                    <TableCell className="text-right">{b.appointments}</TableCell>
                    <TableCell className="text-right">{formatIDR(b.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Admin & Doctor: today's visits */}
      {(role === "admin" || role === "doctor") && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{role === "doctor" ? "Antrian Saya Hari Ini" : "Kunjungan Hari Ini"}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/appointments">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!appointments ? (
              <Skeleton className="h-40 w-full" />
            ) : appointments.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Belum ada kunjungan hari ini." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pasien</TableHead>
                    {role === "admin" && <TableHead>Dokter</TableHead>}
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{fmtTime(a.scheduled_at)}</TableCell>
                      <TableCell>{a.patient.name}</TableCell>
                      {role === "admin" && <TableCell>{a.doctor.name}</TableCell>}
                      <TableCell>
                        <AppointmentStatusBadge status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
