import { useParams } from "react-router-dom"
import { Printer, Stethoscope } from "lucide-react"
import { usePayment } from "@/hooks/use-payments"
import { PageHeader } from "@/components/shared/PageHeader"
import { PaymentStatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/utils/date"
import { formatIDR } from "@/utils/currency"

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold" : "text-sm"}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

export default function PaymentDetailPage() {
  const { id } = useParams()
  const { data: payment, isLoading } = usePayment(Number(id))

  if (isLoading || !payment) return <Skeleton className="h-96 w-full" />

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Detail Pembayaran"
        backTo="/payments"
        backLabel="Riwayat Pembayaran"
        actions={
          <Button onClick={() => window.print()}>
            <Printer className="size-4" /> Cetak Kwitansi
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-col items-center gap-1 border-b pb-4 text-center">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="size-5" />
            </span>
            <p className="font-semibold">Widya Santi Dental Care</p>
            <p className="text-xs text-muted-foreground">{payment.branch_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">No. Kwitansi</span>
            <span className="text-right font-mono text-xs">{payment.invoice_number}</span>
            <span className="text-muted-foreground">Tanggal</span>
            <span className="text-right">{formatDate(payment.paid_at)}</span>
            <span className="text-muted-foreground">Pasien</span>
            <span className="text-right">{payment.patient?.name}</span>
            <span className="text-muted-foreground">Dokter</span>
            <span className="text-right">{payment.doctor_name ?? "-"}</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tindakan</TableHead>
                <TableHead className="text-right">Tarif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payment.details.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {d.name}
                    {d.quantity > 1 ? ` ×${d.quantity}` : ""}
                  </TableCell>
                  <TableCell className="text-right">{formatIDR(d.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-1.5 border-t pt-4">
            <Row label="Subtotal" value={formatIDR(payment.subtotal)} />
            {payment.discount_value > 0 && (
              <Row
                label={`Diskon${payment.discount_type === "percentage" ? ` (${payment.discount_value}%)` : ""}`}
                value={`- ${formatIDR(payment.subtotal - payment.total)}`}
              />
            )}
            <Row label="Total" value={formatIDR(payment.total)} bold />
            <Row label="Dibayar" value={formatIDR(payment.paid_amount)} />
            <Row label="Kembalian" value={formatIDR(payment.change_amount)} />
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-muted-foreground">
                Metode: {payment.payment_method === "cash" ? "Tunai" : "Transfer"}
              </span>
              <PaymentStatusBadge status={payment.status} />
            </div>
          </div>

          <p className="border-t pt-4 text-center text-xs text-muted-foreground">
            Terima kasih atas kunjungan Anda.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
