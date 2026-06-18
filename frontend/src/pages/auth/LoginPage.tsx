import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, Stethoscope } from "lucide-react"
import { useLogin } from "@/hooks/use-auth"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = (values: LoginForm) => login.mutate(values)

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Stethoscope className="size-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Widya Santi Dental Care</h1>
          <p className="text-sm text-muted-foreground">Sistem Manajemen Klinik</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Masuk ke Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {login.isError && (
              <Alert variant="destructive">
                <AlertDescription>{getApiErrorMessage(login.error, "Login gagal.")}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="nama@wsdc.test" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="mt-2 w-full" disabled={login.isPending}>
              {login.isPending && <Loader2 className="size-4 animate-spin" />}
              {login.isPending ? "Memproses..." : "Masuk"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Lupa password? Hubungi Owner atau Admin klinik.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
