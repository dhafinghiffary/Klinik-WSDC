import { cn } from "@/lib/utils"
import type { AppointmentStatus } from "@/types/appointment"
import type { PaymentStatus } from "@/types/payment"

const appointmentMap: Record<AppointmentStatus, { label: string; cls: string }> = {
  scheduled: { label: "Terjadwal", cls: "bg-muted text-muted-foreground" },
  checked_in: { label: "Check-in", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  in_progress: { label: "Diperiksa", cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  completed: { label: "Selesai", cls: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
  no_show: { label: "Tidak Hadir", cls: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
}

const paymentMap: Record<PaymentStatus, { label: string; cls: string }> = {
  paid: { label: "Lunas", cls: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  partial: { label: "Sebagian", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  unpaid: { label: "Belum Bayar", cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
}

function Pill({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cls)}>
      {label}
    </span>
  )
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const m = appointmentMap[status]
  return <Pill label={m.label} cls={m.cls} />
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus | null }) {
  if (!status) return <span className="text-muted-foreground">-</span>
  const m = paymentMap[status]
  return <Pill label={m.label} cls={m.cls} />
}
