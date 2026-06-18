import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Loader2, Search, X } from "lucide-react"
import { useCreateAppointment } from "@/hooks/use-appointments"
import { usePatient, usePatients } from "@/hooks/use-patients"
import { useBranches, useDoctors } from "@/hooks/use-master"
import { useAuthStore } from "@/stores/auth-store"
import { getApiErrorMessage } from "@/api/client"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SelectedPatient {
  id: number
  name: string
  medical_record_number: string
}

export default function AppointmentFormPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role.name === "owner"

  const create = useCreateAppointment()
  const { data: branches } = useBranches()

  const [patient, setPatient] = useState<SelectedPatient | null>(null)
  const [branchId, setBranchId] = useState(user?.branch ? String(user.branch.id) : "")
  const [doctorId, setDoctorId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState("09:00")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preset pasien dari ?patient_id=
  const presetId = params.get("patient_id") ? Number(params.get("patient_id")) : NaN
  const presetPatient = usePatient(presetId)
  useEffect(() => {
    if (presetPatient.data) {
      setPatient({
        id: presetPatient.data.id,
        name: presetPatient.data.name,
        medical_record_number: presetPatient.data.medical_record_number,
      })
    }
  }, [presetPatient.data])

  const { data: doctors } = useDoctors(branchId ? Number(branchId) : undefined)

  // Pencarian pasien async
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])
  const { data: searchResult } = usePatients({ search: debouncedQ, per_page: 5 })
  const showResults = debouncedQ.length >= 2 && !patient

  const submit = () => {
    const e: Record<string, string> = {}
    if (!patient) e.patient = "Pilih pasien terlebih dahulu"
    if (!branchId) e.branch = "Pilih cabang"
    if (!doctorId) e.doctor = "Pilih dokter"
    if (!date) e.date = "Pilih tanggal"
    setErrors(e)
    if (Object.keys(e).length > 0) return

    create.mutate(
      {
        patient_id: patient!.id,
        doctor_id: Number(doctorId),
        branch_id: Number(branchId),
        scheduled_at: `${date}T${time || "09:00"}:00`,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success("Booking berhasil dibuat.")
          navigate("/appointments")
        },
        onError: (er) => toast.error(getApiErrorMessage(er, "Gagal membuat booking.")),
      },
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Booking Appointment Baru" backTo="/appointments" backLabel="Kunjungan" />

      <div className="space-y-6">
        {/* Pilih pasien */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Pasien</CardTitle>
          </CardHeader>
          <CardContent>
            {patient ? (
              <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {patient.medical_record_number}
                  </p>
                </div>
                {!params.get("patient_id") && (
                  <Button variant="ghost" size="icon" onClick={() => setPatient(null)} aria-label="Ganti pasien">
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ketik nama / no. RM / no. HP (min. 2 huruf)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
                {showResults && (
                  <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
                    {(searchResult?.data.length ?? 0) === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">Pasien tidak ditemukan.</p>
                    ) : (
                      searchResult?.data.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent"
                          onClick={() => {
                            setPatient({
                              id: p.id,
                              name: p.name,
                              medical_record_number: p.medical_record_number,
                            })
                            setQ("")
                          }}
                        >
                          <span className="font-medium">{p.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {p.medical_record_number} · {p.phone_number}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {errors.patient && <p className="mt-2 text-sm text-destructive">{errors.patient}</p>}
          </CardContent>
        </Card>

        {/* Jadwal */}
        <Card>
          <CardHeader>
            <CardTitle>Jadwal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Cabang *</Label>
              {isOwner ? (
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={user?.branch?.name ?? ""} readOnly className="bg-muted" />
              )}
              {errors.branch && <p className="text-sm text-destructive">{errors.branch}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Dokter *</Label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dokter" />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctor && <p className="text-sm text-destructive">{errors.doctor}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Jam</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            Simpan Booking
          </Button>
        </div>
      </div>
    </div>
  )
}
