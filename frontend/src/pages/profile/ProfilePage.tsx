import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { authApi } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { useAuthStore } from "@/stores/auth-store"
import { ROLE_LABELS } from "@/constants/roles"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z
  .object({
    current_password: z.string().min(6, "Minimal 6 karakter"),
    password: z.string().min(6, "Minimal 6 karakter"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  })

type FormValues = z.infer<typeof schema>

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "-"}</p>
    </div>
  )
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const changePw = useMutation({
    mutationFn: (v: FormValues) => authApi.changePassword(v),
    onSuccess: () => {
      toast.success("Password berhasil diubah.")
      reset()
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Gagal mengubah password.")),
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profil Akun" backTo="/dashboard" backLabel="Dashboard" />

      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <InfoField label="Nama" value={user?.name} />
            <InfoField label="Email" value={user?.email} />
            <InfoField label="Role" value={user ? ROLE_LABELS[user.role.name] : "-"} />
            <InfoField label="Cabang" value={user?.branch?.name ?? "Semua Cabang"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => changePw.mutate(v))} className="grid max-w-sm gap-4">
            <div className="grid gap-2">
              <Label htmlFor="current_password">Password Saat Ini</Label>
              <Input id="current_password" type="password" {...register("current_password")} />
              {errors.current_password && (
                <p className="text-sm text-destructive">{errors.current_password.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
              <Input id="password_confirmation" type="password" {...register("password_confirmation")} />
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
              )}
            </div>
            <Button type="submit" className="w-fit" disabled={changePw.isPending}>
              {changePw.isPending && <Loader2 className="size-4 animate-spin" />}
              Simpan Password Baru
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
