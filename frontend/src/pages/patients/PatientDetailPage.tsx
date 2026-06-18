import { Link, useNavigate, useParams } from "react-router-dom"
import { CalendarPlus, Pencil, TriangleAlert } from "lucide-react"
import {
  usePatient,
  usePatientHistory,
  usePatientMedicalRecords,
  usePatientPayments,
} from "@/hooks/use-patients"
import { useAuthStore } from "@/stores/auth-store"
import { ROLES } from "@/constants/roles"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { PaymentStatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/utils/date"
import { formatIDR } from "@/utils/currency"

export default function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patientId = Number(id)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role.name === ROLES.ADMIN

  const { data: patient, isLoading } = usePatient(patientId)
  const history = usePatientHistory(patientId)
  const records = usePatientMedicalRecords(patientId)
  const payments = usePatientPayments(patientId)

  if (isLoading || !patient) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Detail Pasien" backTo="/patients" backLabel="Daftar Pasien" />

      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="text-lg">
                  {patient.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{patient.name}</h2>
                <p className="font-mono text-sm text-muted-foreground">
                  {patient.medical_record_number}
                </p>
                <p className="text-sm">
                  {patient.gender === "male" ? "Laki-laki" : "Perempuan"} · {patient.age} tahun
                </p>
                <p className="text-sm text-muted-foreground">{patient.phone_number}</p>
                <p className="text-sm text-muted-foreground">{patient.address}</p>
                <p className="text-sm text-muted-foreground">Cabang asal: {patient.home_branch.name}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to={`/patients/${patient.id}/edit`}>
                    <Pencil className="size-4" /> Edit Data
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={`/appointments/create?patient_id=${patient.id}`}>
                    <CalendarPlus className="size-4" /> Booking
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {patient.drug_allergies && (
            <Alert variant="destructive" className="mt-4">
              <TriangleAlert />
              <AlertTitle>Alergi Obat</AlertTitle>
              <AlertDescription>{patient.drug_allergies}</AlertDescription>
            </Alert>
          )}
          {patient.systemic_conditions && patient.systemic_conditions !== "Tidak ada" && (
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Kondisi sistemik:</span>{" "}
              {patient.systemic_conditions}
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Riwayat Kunjungan</TabsTrigger>
          <TabsTrigger value="records">Rekam Medis</TabsTrigger>
          <TabsTrigger value="payments">Pembayaran</TabsTrigger>
        </TabsList>

        {/* Riwayat kunjungan */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {(history.data?.length ?? 0) === 0 ? (
                <EmptyState title="Belum ada riwayat kunjungan." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Dokter</TableHead>
                      <TableHead>Tindakan</TableHead>
                      <TableHead>Status Bayar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.data?.map((h) => (
                      <TableRow
                        key={h.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/medical-records/${h.id}`)}
                      >
                        <TableCell>{formatDate(h.visit_date)}</TableCell>
                        <TableCell>{h.doctor_name}</TableCell>
                        <TableCell>{h.treatment_summary}</TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={h.payment_status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rekam medis */}
        <TabsContent value="records">
          <Card>
            <CardContent className="p-0">
              {(records.data?.length ?? 0) === 0 ? (
                <EmptyState title="Belum ada rekam medis." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Dokter</TableHead>
                      <TableHead>Diagnosa</TableHead>
                      <TableHead className="text-right">Jml Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.data?.map((r) => (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/medical-records/${r.id}`)}
                      >
                        <TableCell>{formatDate(r.visit_date)}</TableCell>
                        <TableCell>{r.doctor_name}</TableCell>
                        <TableCell>{r.diagnosis_summary}</TableCell>
                        <TableCell className="text-right">{r.treatment_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pembayaran */}
        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              {(payments.data?.length ?? 0) === 0 ? (
                <EmptyState title="Belum ada riwayat pembayaran." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>No. Kwitansi</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.data?.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{formatDate(p.paid_at)}</TableCell>
                        <TableCell className="font-mono text-xs">{p.invoice_number}</TableCell>
                        <TableCell className="text-right">{formatIDR(p.total)}</TableCell>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
