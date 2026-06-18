import { Link, useParams } from "react-router-dom"
import { Pencil, Wallet } from "lucide-react"
import { useMedicalRecord } from "@/hooks/use-medical-records"
import { useOdontogramConditions } from "@/hooks/use-master"
import { useAuthStore } from "@/stores/auth-store"
import { ROLES } from "@/constants/roles"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/utils/date"
import { formatIDR } from "@/utils/currency"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function MedicalRecordDetailPage() {
  const { id } = useParams()
  const recordId = Number(id)
  const user = useAuthStore((s) => s.user)
  const isDoctor = user?.role.name === ROLES.DOCTOR
  const isAdmin = user?.role.name === ROLES.ADMIN

  const { data: record, isLoading } = useMedicalRecord(recordId)
  const { data: conditions } = useOdontogramConditions()

  if (isLoading || !record) {
    return <Skeleton className="h-96 w-full" />
  }

  const total = record.treatments.reduce((s, t) => s + (t.price || 0), 0)
  const condName = (code: string) => conditions?.find((c) => c.code === code)?.name ?? code

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Rekam Medis — ${formatDate(record.visit_date)}`}
        description={`${record.patient?.name ?? ""} · ${record.doctor_name ?? ""} · ${record.branch_name ?? ""}`}
        backTo={record.patient ? `/patients/${record.patient.id}` : "/dashboard"}
        backLabel="Detail Pasien"
        actions={
          <>
            {isDoctor && (
              <Button asChild variant="outline">
                <Link to={`/medical-records/${record.id}/edit`}>
                  <Pencil className="size-4" /> Edit
                </Link>
              </Button>
            )}
            {isAdmin && !record.has_payment && (
              <Button asChild>
                <Link to={`/payments/create?medical_record_id=${record.id}`}>
                  <Wallet className="size-4" /> Proses Pembayaran
                </Link>
              </Button>
            )}
          </>
        }
      />

      <div className="space-y-5">
        <Section title="Anamnesa">
          <p className="whitespace-pre-wrap text-sm">{record.anamnesis || "-"}</p>
        </Section>

        <Section title="Diagnosa">
          {record.diagnoses.length === 0 ? (
            <p className="text-sm text-muted-foreground">-</p>
          ) : (
            <ul className="list-inside list-disc space-y-1 text-sm">
              {record.diagnoses.map((d, i) => (
                <li key={i}>
                  {d.tooth_number ? `Gigi ${d.tooth_number}: ` : ""}
                  {d.description}
                  {d.notes ? ` (${d.notes})` : ""}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Tindakan">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tindakan</TableHead>
                <TableHead>Gigi</TableHead>
                <TableHead className="text-right">Tarif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {record.treatments.map((t, i) => (
                <TableRow key={i}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.tooth_number || "-"}</TableCell>
                  <TableCell className="text-right">{formatIDR(t.price)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">{formatIDR(total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="Resep">
          {record.prescriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">-</p>
          ) : (
            <ol className="list-inside list-decimal space-y-1 text-sm">
              {record.prescriptions.map((p, i) => (
                <li key={i}>
                  {p.medicine_name} — {p.frequency}, {p.quantity}
                  {p.instruction ? ` (${p.instruction})` : ""}
                </li>
              ))}
            </ol>
          )}
        </Section>

        <Section title="Odontogram">
          {record.odontograms.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada kondisi ditandai.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {record.odontograms.map((o, i) => (
                <li key={i}>
                  <span className="font-medium">Gigi {o.tooth_number}:</span> {condName(o.condition_code)}
                  {o.notes ? ` — ${o.notes}` : ""}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {record.additional_notes && (
          <Section title="Catatan Tambahan">
            <p className="whitespace-pre-wrap text-sm">{record.additional_notes}</p>
          </Section>
        )}
      </div>
    </div>
  )
}
