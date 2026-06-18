import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { usePatient, useSavePatient } from "@/hooks/use-patients"
import { getApiErrorMessage } from "@/api/client"
import { calculateAge } from "@/utils/date"
import type { PatientFormData } from "@/types/patient"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"

const schema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi").max(200),
    nik: z.union([z.literal(""), z.string().regex(/^\d{16}$/, "NIK harus 16 digit")]),
    birth_place: z.string().min(1, "Tempat lahir wajib diisi").max(100),
    birth_date: z.string().min(1, "Tanggal lahir wajib diisi"),
    gender: z.enum(["male", "female"], { message: "Pilih jenis kelamin" }),
    phone_number: z.string().min(1, "No. HP wajib diisi").max(20),
    address: z.string().min(1, "Alamat wajib diisi"),
    occupation: z.string().max(100).optional(),
    drug_allergies: z.string().optional(),
    systemic_conditions: z.string().optional(),
    guardian_name: z.string().optional(),
    guardian_phone: z.string().optional(),
    guardian_relation: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.birth_date && calculateAge(d.birth_date) < 17 && !d.guardian_name?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["guardian_name"],
        message: "Nama wali wajib diisi untuk pasien di bawah 17 tahun",
      })
    }
  })

type FormValues = z.infer<typeof schema>

const emptyValues: FormValues = {
  name: "", nik: "", birth_place: "", birth_date: "", gender: "male",
  phone_number: "", address: "", occupation: "", drug_allergies: "",
  systemic_conditions: "", guardian_name: "", guardian_phone: "", guardian_relation: "",
}

export default function PatientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patientId = id ? Number(id) : undefined
  const isEdit = patientId !== undefined

  const { data: patient, isLoading: loadingPatient } = usePatient(patientId ?? NaN)
  const save = useSavePatient(patientId)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues })

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        nik: patient.nik ?? "",
        birth_place: patient.birth_place,
        birth_date: patient.birth_date,
        gender: patient.gender,
        phone_number: patient.phone_number,
        address: patient.address,
        occupation: patient.occupation ?? "",
        drug_allergies: patient.drug_allergies ?? "",
        systemic_conditions: patient.systemic_conditions ?? "",
        guardian_name: patient.guardian_name ?? "",
        guardian_phone: patient.guardian_phone ?? "",
        guardian_relation: patient.guardian_relation ?? "",
      })
    }
  }, [patient, reset])

  const birthDate = watch("birth_date")
  const showGuardian = birthDate ? calculateAge(birthDate) < 17 : false

  const onSubmit = (v: FormValues) => {
    const payload: PatientFormData = {
      name: v.name,
      nik: v.nik || null,
      birth_place: v.birth_place,
      birth_date: v.birth_date,
      gender: v.gender,
      phone_number: v.phone_number,
      address: v.address,
      occupation: v.occupation || null,
      drug_allergies: v.drug_allergies || null,
      systemic_conditions: v.systemic_conditions || null,
      guardian_name: showGuardian ? v.guardian_name || null : null,
      guardian_phone: showGuardian ? v.guardian_phone || null : null,
      guardian_relation: showGuardian ? v.guardian_relation || null : null,
    }
    save.mutate(payload, {
      onSuccess: (p) => {
        toast.success("Pasien berhasil disimpan.")
        navigate(`/patients/${p.id}`)
      },
      onError: (e) => toast.error(getApiErrorMessage(e, "Gagal menyimpan pasien.")),
    })
  }

  if (isEdit && loadingPatient) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isEdit ? `Edit Data Pasien: ${patient?.name ?? ""}` : "Tambah Pasien Baru"}
        backTo={isEdit ? `/patients/${patientId}` : "/patients"}
        backLabel={isEdit ? "Detail Pasien" : "Daftar Pasien"}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Identitas */}
        <Card>
          <CardHeader>
            <CardTitle>Data Identitas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nik">NIK</Label>
              <Input id="nik" inputMode="numeric" placeholder="16 digit (opsional)" {...register("nik")} />
              {errors.nik && <p className="text-sm text-destructive">{errors.nik.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birth_place">Tempat Lahir *</Label>
              <Input id="birth_place" {...register("birth_place")} />
              {errors.birth_place && <p className="text-sm text-destructive">{errors.birth_place.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birth_date">Tanggal Lahir *</Label>
              <Input id="birth_date" type="date" {...register("birth_date")} />
              {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Jenis Kelamin *</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6 pt-1">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal">Laki-laki</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal">Perempuan</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone_number">Nomor HP *</Label>
              <Input id="phone_number" inputMode="tel" {...register("phone_number")} />
              {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number.message}</p>}
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="address">Alamat *</Label>
              <Textarea id="address" {...register("address")} />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="occupation">Pekerjaan</Label>
              <Input id="occupation" {...register("occupation")} />
            </div>
          </CardContent>
        </Card>

        {/* Data medis */}
        <Card>
          <CardHeader>
            <CardTitle>Data Medis (opsional)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="drug_allergies">Alergi Obat</Label>
              <Textarea id="drug_allergies" placeholder="Contoh: Penisilin" {...register("drug_allergies")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="systemic_conditions">Kondisi Sistemik</Label>
              <Textarea id="systemic_conditions" placeholder="Contoh: Diabetes, Hipertensi" {...register("systemic_conditions")} />
            </div>
          </CardContent>
        </Card>

        {/* Data wali */}
        {showGuardian && (
          <Card>
            <CardHeader>
              <CardTitle>Data Wali (pasien di bawah 17 tahun)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="guardian_name">Nama Wali *</Label>
                <Input id="guardian_name" {...register("guardian_name")} />
                {errors.guardian_name && <p className="text-sm text-destructive">{errors.guardian_name.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guardian_relation">Hubungan</Label>
                <Input id="guardian_relation" placeholder="Ayah / Ibu / Wali" {...register("guardian_relation")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guardian_phone">No. HP Wali</Label>
                <Input id="guardian_phone" inputMode="tel" {...register("guardian_phone")} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Simpan Pasien
          </Button>
        </div>
      </form>
    </div>
  )
}
