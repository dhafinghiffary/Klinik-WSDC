import { useState } from "react"
import { CalendarRange, FileSpreadsheet, Users, Wallet, Receipt, UserPlus } from "lucide-react"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useReport } from "@/hooks/use-reports"
import type { ReportParams } from "@/api/reports"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatIDR } from "@/utils/currency"

type Period = ReportParams["period"]

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)"]

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("month")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const { data, isLoading } = useReport({
    period,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  })

  const pieData = data
    ? [
        { name: "Pasien Baru", value: data.summary.new_patients },
        { name: "Pasien Lama", value: data.summary.returning_patients },
      ]
    : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan & Analitik"
        actions={
          <Button variant="outline" onClick={() => toast.info("Ekspor menunggu integrasi backend.")}>
            <FileSpreadsheet className="size-4" /> Ekspor
          </Button>
        }
      />

      {/* Filter */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label>Periode</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="week">Minggu Ini</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="year">Tahun Ini</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === "custom" && (
              <>
                <div className="grid gap-1.5">
                  <Label>Dari</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Sampai</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarRange className="size-4" />
              Menampilkan data periode terpilih
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Pendapatan" value={formatIDR(data.summary.total_revenue)} icon={Wallet} />
          <StatCard label="Total Transaksi" value={data.summary.total_transactions} icon={Receipt} />
          <StatCard label="Pasien Baru" value={data.summary.new_patients} icon={UserPlus} />
          <StatCard
            label="Total Kunjungan Pasien"
            value={data.summary.new_patients + data.summary.returning_patients}
            icon={Users}
          />
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tren Pendapatan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.revenue_trend} margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Number(v) / 1_000_000}jt`} />
                    <Tooltip formatter={(v) => formatIDR(Number(v))} />
                    <Line type="monotone" dataKey="total" stroke="var(--chart-1)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pasien Baru vs Lama</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pendapatan per Cabang</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.by_branch} margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Number(v) / 1_000_000}jt`} />
                    <Tooltip formatter={(v) => formatIDR(Number(v))} />
                    <Bar dataKey="total" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pendapatan per Dokter</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.by_doctor} layout="vertical" margin={{ left: 20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Number(v) / 1_000_000}jt`} />
                    <YAxis type="category" dataKey="label" width={110} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v) => formatIDR(Number(v))} />
                    <Bar dataKey="total" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
