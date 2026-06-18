import { useState } from "react"
import { Link } from "react-router-dom"
import { CalendarPlus, CalendarX, CheckCircle2, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointments"
import { useDoctors } from "@/hooks/use-master"
import { useAuthStore } from "@/stores/auth-store"
import { ROLES } from "@/constants/roles"
import type { AppointmentStatus } from "@/types/appointment"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { AppointmentStatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "checked_in", label: "Check-in" },
  { value: "in_progress", label: "Diperiksa" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "no_show", label: "Tidak Hadir" },
]

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export default function AppointmentListPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role.name === ROLES.ADMIN
  const isDoctor = user?.role.name === ROLES.DOCTOR

  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [doctorId, setDoctorId] = useState("all")
  const [status, setStatus] = useState("all")
  const [checkInId, setCheckInId] = useState<number | null>(null)

  const { data: doctors } = useDoctors()
  const { data, isLoading } = useAppointments({
    date,
    doctor_id: doctorId === "all" ? undefined : Number(doctorId),
    status: status === "all" ? undefined : (status as AppointmentStatus),
  })
  const updateStatus = useUpdateAppointmentStatus()

  const appointments = data?.data ?? []

  const confirmCheckIn = () => {
    if (checkInId == null) return
    updateStatus.mutate(
      { id: checkInId, status: "checked_in" },
      {
        onSuccess: () => toast.success("Pasien berhasil di-check-in."),
        onError: () => toast.error("Gagal memperbarui status."),
      },
    )
    setCheckInId(null)
  }

  return (
    <div>
      <PageHeader
        title="Kunjungan & Appointment"
        description="Kelola jadwal dan status kunjungan pasien."
        actions={
          isAdmin && (
            <Button asChild>
              <Link to="/appointments/create">
                <CalendarPlus className="size-4" /> Booking Baru
              </Link>
            </Button>
          )
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="date">Tanggal</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>Dokter</Label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Dokter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Dokter</SelectItem>
              {doctors?.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead className="hidden md:table-cell">Dokter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState icon={CalendarX} title="Tidak ada kunjungan untuk filter ini." />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{fmtTime(a.scheduled_at)}</TableCell>
                    <TableCell>
                      <Link to={`/patients/${a.patient.id}`} className="hover:underline">
                        {a.patient.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{a.doctor.name}</TableCell>
                    <TableCell>
                      <AppointmentStatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin && a.status === "scheduled" && (
                        <Button size="sm" variant="outline" onClick={() => setCheckInId(a.id)}>
                          <CheckCircle2 className="size-4" /> Check-in
                        </Button>
                      )}
                      {isDoctor && (a.status === "checked_in" || a.status === "in_progress") && (
                        <Button asChild size="sm">
                          <Link to={`/medical-records/create?appointment_id=${a.id}`}>
                            <Stethoscope className="size-4" /> Rekam Medis
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={checkInId != null}
        onOpenChange={(o) => !o && setCheckInId(null)}
        title="Check-in Pasien?"
        description="Pasien akan ditandai sudah datang dan masuk antrian pemeriksaan."
        confirmLabel="Ya, Check-in"
        onConfirm={confirmCheckIn}
      />
    </div>
  )
}
