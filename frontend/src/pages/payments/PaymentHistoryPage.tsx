import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Receipt, Search } from "lucide-react"
import { usePayments } from "@/hooks/use-payments"
import type { PaymentMethod } from "@/types/payment"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { PaymentStatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/utils/date"
import { formatIDR } from "@/utils/currency"

const PER_PAGE = 10

export default function PaymentHistoryPage() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [method, setMethod] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading } = usePayments({
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    payment_method: method === "all" ? undefined : (method as PaymentMethod),
    search,
    page,
    per_page: PER_PAGE,
  })

  const payments = data?.data ?? []
  const pagination = data?.meta.pagination
  const pageTotal = payments.reduce((s, p) => s + p.total, 0)

  return (
    <div>
      <PageHeader title="Riwayat Pembayaran" description="Daftar transaksi pembayaran klinik." />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor="from">Dari Tanggal</Label>
          <Input id="from" type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="to">Sampai Tanggal</Label>
          <Input id="to" type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} />
        </div>
        <div className="grid gap-1.5">
          <Label>Metode</Label>
          <Select value={method} onValueChange={(v) => { setMethod(v); setPage(1) }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Metode</SelectItem>
              <SelectItem value="cash">Tunai</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="search">Cari</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nama / no. kwitansi"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Kwitansi</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden sm:table-cell">Metode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState icon={Receipt} title="Tidak ada transaksi untuk filter ini." />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.invoice_number}</TableCell>
                    <TableCell>{p.patient?.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(p.paid_at)}</TableCell>
                    <TableCell className="text-right">{formatIDR(p.total)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {p.payment_method === "cash" ? "Tunai" : "Transfer"}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/payments/${p.id}`}>Lihat</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
        <span className="font-medium">Total halaman ini: {formatIDR(pageTotal)}</span>
        {pagination && pagination.total > 0 && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>
              {pagination.from}–{pagination.to} dari {pagination.total}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
