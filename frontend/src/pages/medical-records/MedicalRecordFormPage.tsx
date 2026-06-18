import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, TriangleAlert } from "lucide-react"
import { appointmentsApi } from "@/api/appointments"
import { useMedicalRecord, useSaveMedicalRecord } from "@/hooks/use-medical-records"
import { usePatient } from "@/hooks/use-patients"
import { useTreatments, useOdontogramConditions } from "@/hooks/use-master"
import { getApiErrorMessage } from "@/api/client"
import type { Diagnosis, Prescription, Treatment } from "@/types/medical-record"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatIDR } from "@/utils/currency"
import { cn } from "@/lib/utils"

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

type OdontoMap = Record<string, { condition_code: string; notes: string }>

export default function MedicalRecordFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editMode = !!id
  const apptId = params.get("appointment_id")

  const recordQuery = useMedicalRecord(Number(id))
  const appointmentQuery = useQuery({
    queryKey: ["appointment", apptId],
    queryFn: () => appointmentsApi.get(Number(apptId)),
    enabled: !!apptId,
  })
  const { data: treatmentMasters } = useTreatments()
  const { data: conditions } = useOdontogramConditions()
  const save = useSaveMedicalRecord(editMode ? Number(id) : undefined)

  // Tentukan pasien
  const patientId = editMode
    ? recordQuery.data?.patient_id
    : apptId
      ? appointmentQuery.data?.patient.id
      : params.get("patient_id")
        ? Number(params.get("patient_id"))
        : undefined
  const { data: patient } = usePatient(patientId ?? NaN)

  // State form
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [anamnesis, setAnamnesis] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [odonto, setOdonto] = useState<OdontoMap>({})
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Prefill (edit)
  useEffect(() => {
    const r = recordQuery.data
    if (editMode && r) {
      setVisitDate(r.visit_date)
      setAnamnesis(r.anamnesis ?? "")
      setAdditionalNotes(r.additional_notes ?? "")
      setDiagnoses(r.diagnoses)
      setTreatments(r.treatments)
      setPrescriptions(r.prescriptions)
      const map: OdontoMap = {}
      r.odontograms.forEach((o) => (map[o.tooth_number] = { condition_code: o.condition_code, notes: o.notes ?? "" }))
      setOdonto(map)
    }
  }, [editMode, recordQuery.data])

  const treatmentTotal = treatments.reduce((s, t) => s + (t.price || 0), 0)

  const submit = (goToPayment: boolean) => {
    setFormError(null)
    if (!patientId) {
      setFormError("Data pasien tidak ditemukan.")
      return
    }
    if (!anamnesis.trim()) {
      setFormError("Anamnesa wajib diisi.")
      return
    }
    const validTreatments = treatments.filter((t) => t.name.trim())
    if (validTreatments.length === 0) {
      setFormError("Minimal satu tindakan harus diisi.")
      return
    }

    save.mutate(
      {
        patient_id: patientId,
        appointment_id: apptId ? Number(apptId) : null,
        visit_date: visitDate,
        anamnesis: anamnesis.trim(),
        additional_notes: additionalNotes || null,
        diagnoses: diagnoses.filter((d) => d.description.trim()),
        treatments: validTreatments,
        prescriptions: prescriptions.filter((p) => p.medicine_name.trim()),
        odontograms: Object.entries(odonto).map(([tooth, v]) => ({
          tooth_number: tooth,
          condition_code: v.condition_code,
          notes: v.notes || null,
        })),
      },
      {
        onSuccess: (rec) => {
          toast.success("Rekam medis berhasil disimpan.")
          if (goToPayment) navigate(`/payments/create?medical_record_id=${rec.id}`)
          else navigate(`/medical-records/${rec.id}`)
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Gagal menyimpan rekam medis.")),
      },
    )
  }

  if (editMode && recordQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  const conditionByCode = (code: string) => conditions?.find((c) => c.code === code)

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={editMode ? "Edit Rekam Medis" : "Rekam Medis Baru"}
        description={patient ? `${patient.name} · ${patient.medical_record_number}` : undefined}
        backTo="/appointments"
        backLabel="Kunjungan"
      />

      {patient?.drug_allergies && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert />
          <AlertTitle>Alergi Obat: {patient.drug_allergies}</AlertTitle>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Info kunjungan */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kunjungan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Pasien</p>
              <p className="font-medium">{patient?.name ?? "-"}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visit_date">Tanggal Kunjungan</Label>
              <Input id="visit_date" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* 1. Anamnesa */}
        <Card>
          <CardHeader>
            <CardTitle>1. Anamnesa *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={anamnesis}
              onChange={(e) => setAnamnesis(e.target.value)}
              placeholder="Keluhan utama, riwayat keluhan, riwayat perawatan sebelumnya..."
              className="min-h-28"
            />
          </CardContent>
        </Card>

        {/* 2. Diagnosa */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>2. Diagnosa</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDiagnoses((d) => [...d, { tooth_number: "", description: "", notes: "" }])}
            >
              <Plus className="size-4" /> Tambah
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnoses.length === 0 && <p className="text-sm text-muted-foreground">Belum ada diagnosa.</p>}
            {diagnoses.map((d, i) => (
              <div key={i} className="grid items-start gap-2 sm:grid-cols-[80px_1fr_1fr_auto]">
                <Input
                  placeholder="Gigi"
                  value={d.tooth_number ?? ""}
                  onChange={(e) =>
                    setDiagnoses((arr) => arr.map((x, j) => (j === i ? { ...x, tooth_number: e.target.value } : x)))
                  }
                />
                <Input
                  placeholder="Nama diagnosa"
                  value={d.description}
                  onChange={(e) =>
                    setDiagnoses((arr) => arr.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))
                  }
                />
                <Input
                  placeholder="Catatan"
                  value={d.notes ?? ""}
                  onChange={(e) =>
                    setDiagnoses((arr) => arr.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))
                  }
                />
                <Button variant="ghost" size="icon" onClick={() => setDiagnoses((arr) => arr.filter((_, j) => j !== i))} aria-label="Hapus">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Tindakan */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>3. Tindakan *</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setTreatments((t) => [
                  ...t,
                  { treatment_master_id: null, name: "", tooth_number: "", price: 0, notes: "" },
                ])
              }
            >
              <Plus className="size-4" /> Tambah
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {treatments.length === 0 && <p className="text-sm text-muted-foreground">Belum ada tindakan.</p>}
            {treatments.map((t, i) => (
              <div key={i} className="grid items-start gap-2 sm:grid-cols-[80px_1fr_140px_auto]">
                <Input
                  placeholder="Gigi"
                  value={t.tooth_number ?? ""}
                  onChange={(e) =>
                    setTreatments((arr) => arr.map((x, j) => (j === i ? { ...x, tooth_number: e.target.value } : x)))
                  }
                />
                <Select
                  value={t.treatment_master_id ? String(t.treatment_master_id) : ""}
                  onValueChange={(v) => {
                    const m = treatmentMasters?.find((x) => String(x.id) === v)
                    setTreatments((arr) =>
                      arr.map((x, j) =>
                        j === i ? { ...x, treatment_master_id: Number(v), name: m?.name ?? x.name, price: m?.price ?? x.price } : x,
                      ),
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tindakan" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatmentMasters?.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Tarif"
                  value={t.price || ""}
                  onChange={(e) =>
                    setTreatments((arr) => arr.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)))
                  }
                />
                <Button variant="ghost" size="icon" onClick={() => setTreatments((arr) => arr.filter((_, j) => j !== i))} aria-label="Hapus">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {treatments.length > 0 && (
              <p className="text-right text-sm font-medium">Total: {formatIDR(treatmentTotal)}</p>
            )}
          </CardContent>
        </Card>

        {/* 4. Resep */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>4. Resep</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPrescriptions((p) => [
                  ...p,
                  { medicine_name: "", dosage: "", frequency: "", quantity: "", instruction: "" },
                ])
              }
            >
              <Plus className="size-4" /> Tambah
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {prescriptions.length === 0 && <p className="text-sm text-muted-foreground">Belum ada resep.</p>}
            {prescriptions.map((p, i) => (
              <div key={i} className="grid items-start gap-2 sm:grid-cols-[1fr_100px_100px_90px_auto]">
                <Input
                  placeholder="Nama obat"
                  value={p.medicine_name}
                  onChange={(e) =>
                    setPrescriptions((arr) => arr.map((x, j) => (j === i ? { ...x, medicine_name: e.target.value } : x)))
                  }
                />
                <Input
                  placeholder="Dosis"
                  value={p.dosage}
                  onChange={(e) =>
                    setPrescriptions((arr) => arr.map((x, j) => (j === i ? { ...x, dosage: e.target.value } : x)))
                  }
                />
                <Input
                  placeholder="Frekuensi"
                  value={p.frequency}
                  onChange={(e) =>
                    setPrescriptions((arr) => arr.map((x, j) => (j === i ? { ...x, frequency: e.target.value } : x)))
                  }
                />
                <Input
                  placeholder="Jumlah"
                  value={p.quantity}
                  onChange={(e) =>
                    setPrescriptions((arr) => arr.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))
                  }
                />
                <Button variant="ghost" size="icon" onClick={() => setPrescriptions((arr) => arr.filter((_, j) => j !== i))} aria-label="Hapus">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 5. Odontogram */}
        <Card>
          <CardHeader>
            <CardTitle>5. Odontogram</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Klik nomor gigi untuk menandai kondisi.</p>
            {[UPPER, LOWER].map((row, ri) => (
              <div key={ri} className="flex flex-wrap justify-center gap-1">
                {row.map((tooth) => {
                  const code = odonto[tooth]?.condition_code
                  const cond = code ? conditionByCode(code) : undefined
                  return (
                    <button
                      key={tooth}
                      type="button"
                      onClick={() => setSelectedTooth(String(tooth))}
                      className={cn(
                        "flex size-9 items-center justify-center rounded border text-xs font-medium transition-colors hover:bg-accent",
                        cond ? "text-white" : "bg-background",
                      )}
                      style={cond?.color ? { backgroundColor: cond.color, borderColor: cond.color } : undefined}
                      title={cond ? cond.name : `Gigi ${tooth}`}
                    >
                      {tooth}
                    </button>
                  )
                })}
              </div>
            ))}
            {/* Legenda */}
            <div className="flex flex-wrap gap-3 pt-2">
              {conditions?.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5 text-xs">
                  <span className="size-3 rounded" style={{ backgroundColor: c.color ?? "#999" }} />
                  {c.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Catatan tambahan */}
        <Card>
          <CardHeader>
            <CardTitle>Catatan Tambahan Dokter</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} />
          </CardContent>
        </Card>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button variant="secondary" onClick={() => submit(false)} disabled={save.isPending}>
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Simpan Rekam Medis
          </Button>
          <Button onClick={() => submit(true)} disabled={save.isPending}>
            Simpan & ke Pembayaran
          </Button>
        </div>
      </div>

      {/* Dialog kondisi gigi */}
      <Dialog open={selectedTooth != null} onOpenChange={(o) => !o && setSelectedTooth(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kondisi Gigi {selectedTooth}</DialogTitle>
          </DialogHeader>
          {selectedTooth && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Kondisi</Label>
                <Select
                  value={odonto[selectedTooth]?.condition_code ?? ""}
                  onValueChange={(v) =>
                    setOdonto((m) => ({ ...m, [selectedTooth]: { condition_code: v, notes: m[selectedTooth]?.notes ?? "" } }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions?.map((c) => (
                      <SelectItem key={c.id} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Catatan</Label>
                <Input
                  value={odonto[selectedTooth]?.notes ?? ""}
                  onChange={(e) =>
                    setOdonto((m) => ({
                      ...m,
                      [selectedTooth]: {
                        condition_code: m[selectedTooth]?.condition_code ?? "",
                        notes: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedTooth && odonto[selectedTooth] && (
              <Button
                variant="outline"
                onClick={() => {
                  setOdonto((m) => {
                    const next = { ...m }
                    delete next[selectedTooth]
                    return next
                  })
                  setSelectedTooth(null)
                }}
              >
                Hapus Kondisi
              </Button>
            )}
            <Button onClick={() => setSelectedTooth(null)}>Selesai</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
