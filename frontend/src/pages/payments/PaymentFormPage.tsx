import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useMedicalRecord } from "@/hooks/use-medical-records"
import { useCreatePayment } from "@/hooks/use-payments"
import { getApiErrorMessage } from "@/api/client"
import type { DiscountType, PaymentMethod } from "@/types/payment"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatIDR } from "@/utils/currency"
import { formatDate } from "@/utils/date"

interface LineItem {
  treatment_master_id: number | null
  name: string
  price: number
  checked: boolean
}

export default function PaymentFormPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mrId = params.get("medical_record_id")
  const { data: record, isLoading } = useMedicalRecord(Number(mrId))
  const create = useCreatePayment()

  const [items, setItems] = useState<LineItem[]>([])
  const [discountType, setDiscountType] = useState<"none" | DiscountType>("none")
  const [discountValue, setDiscountValue] = useState(0)
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [paid, setPaid] = useState(0)

  useEffect(() => {
    if (record) {
      setItems(
        record.treatments.map((t) => ({
          treatment_master_id: t.treatment_master_id,
          name: t.name,
          price: t.price,
          checked: true,
        })),
      )
    }
  }, [record])

  const subtotal = items.filter((i) => i.checked).reduce((s, i) => s + i.price, 0)
  const discount =
    discountType === "percentage"
      ? Math.round((subtotal * discountValue) / 100)
      : discountType === "nominal"
        ? discountValue
        : 0
  const total = Math.max(0, subtotal - discount)
  const change = Math.max(0, paid - total)
  const isUnderpaid = method === "cash" && paid < total

  const submit = () => {
    const chosen = items.filter((i) => i.checked)
    if (chosen.length === 0) {
      toast.error("Pilih minimal satu tindakan.")
      return
    }
    if (!record) return
    create.mutate(
      {
        patient_id: record.patient_id,
        medical_record_id: record.id,
        details: chosen.map((i) => ({
          treatment_master_id: i.treatment_master_id,
          name: i.name,
          price: i.price,
          quantity: 1,
        })),
        discount_type: discountType === "none" ? null : discountType,
        discount_value: discountType === "none" ? 0 : discountValue,
        payment_method: method,
        paid_amount: method === "cash" ? paid : total,
      },
      {
        onSuccess: (p) => {
          toast.success("Pembayaran berhasil diproses.")
          navigate(`/payments/${p.id}`)
        },
        onError: (e) => toast.error(getApiErrorMessage(e, "Gagal memproses pembayaran.")),
      },
    )
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (!mrId || !record) {
    return (
      <div>
        <PageHeader title="Proses Pembayaran" backTo="/payments" backLabel="Riwayat Pembayaran" />
        <EmptyState title="Rekam medis tidak ditemukan." description="Pembayaran harus dibuat dari rekam medis." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Proses Pembayaran"
        backTo={`/medical-records/${record.id}`}
        backLabel="Rekam Medis"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kunjungan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p><span className="text-muted-foreground">Pasien:</span> {record.patient?.name}</p>
            <p><span className="text-muted-foreground">No. RM:</span> {record.patient?.medical_record_number}</p>
            <p><span className="text-muted-foreground">Dokter:</span> {record.doctor_name}</p>
            <p><span className="text-muted-foreground">Tanggal:</span> {formatDate(record.visit_date)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rincian Tindakan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-3">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={(c) =>
                      setItems((arr) => arr.map((x, j) => (j === i ? { ...x, checked: Boolean(c) } : x)))
                    }
                  />
                  <span className="text-sm">{item.name}</span>
                </label>
                <span className="text-sm font-medium">{formatIDR(item.price)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 text-sm font-medium">
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="grid gap-2">
                <Label>Diskon</Label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as "none" | DiscountType)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Diskon</SelectItem>
                    <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {discountType !== "none" && (
                <div className="grid gap-2">
                  <Label>Nilai Diskon</Label>
                  <Input
                    type="number"
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-36"
                  />
                </div>
              )}
              <div className="ml-auto text-right">
                <p className="text-sm text-muted-foreground">Potongan</p>
                <p className="font-medium">- {formatIDR(discount)}</p>
              </div>
            </div>

            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total Bayar</span>
              <span>{formatIDR(total)}</span>
            </div>

            <div className="grid gap-2">
              <Label>Metode Pembayaran</Label>
              <RadioGroup
                value={method}
                onValueChange={(v) => setMethod(v as PaymentMethod)}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="font-normal">Tunai</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Label htmlFor="transfer" className="font-normal">Transfer Bank</Label>
                </div>
              </RadioGroup>
            </div>

            {method === "cash" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="paid">Jumlah Dibayar</Label>
                  <Input
                    id="paid"
                    type="number"
                    value={paid || ""}
                    onChange={(e) => setPaid(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Kembalian</Label>
                  <p className="rounded-md border bg-muted px-3 py-2 text-sm font-medium">
                    {formatIDR(change)}
                  </p>
                </div>
              </div>
            )}

            {isUnderpaid && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Pembayaran kurang dari total. Akan dicatat sebagai pembayaran sebagian (Partial).
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            Proses Pembayaran
          </Button>
        </div>
      </div>
    </div>
  )
}
