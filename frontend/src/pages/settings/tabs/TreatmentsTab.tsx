import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Plus, Power } from "lucide-react"
import { useTreatments } from "@/hooks/use-master"
import { treatmentsApi, type TreatmentMaster, type TreatmentFormData } from "@/api/master"
import { getApiErrorMessage } from "@/api/client"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatIDR } from "@/utils/currency"

const empty: TreatmentFormData = { name: "", price: 0 }

export function TreatmentsTab() {
  const qc = useQueryClient()
  const { data: treatments } = useTreatments()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TreatmentMaster | null>(null)
  const [form, setForm] = useState<TreatmentFormData>(empty)
  const [removeId, setRemoveId] = useState<number | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ["treatments"] })
  const save = useMutation({
    mutationFn: () => (editing ? treatmentsApi.update(editing.id, form) : treatmentsApi.create(form)),
    onSuccess: () => {
      invalidate()
      setOpen(false)
      toast.success("Tindakan tersimpan.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (id: number) => treatmentsApi.remove(id),
    onSuccess: () => {
      invalidate()
      setRemoveId(null)
      toast.success("Tindakan dinonaktifkan.")
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null)
            setForm(empty)
            setOpen(true)
          }}
        >
          <Plus className="size-4" /> Tambah Tindakan
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Tindakan</TableHead>
              <TableHead className="text-right">Tarif</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treatments?.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.code}</TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-right">{formatIDR(t.price)}</TableCell>
                <TableCell>{t.is_active ? "Aktif" : "Nonaktif"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    onClick={() => {
                      setEditing(t)
                      setForm({ name: t.name, price: t.price })
                      setOpen(true)
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {t.is_active && (
                    <Button variant="ghost" size="icon" aria-label="Nonaktifkan" onClick={() => setRemoveId(t.id)}>
                      <Power className="size-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tindakan" : "Tambah Tindakan"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nama Tindakan</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Tarif (Rp)</Label>
              <Input
                type="number"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => save.mutate()} disabled={!form.name || save.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeId != null}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title="Nonaktifkan Tindakan?"
        description="Tindakan tidak akan muncul di pilihan baru. Data lama tetap tersimpan."
        confirmLabel="Ya, Nonaktifkan"
        destructive
        onConfirm={() => removeId && remove.mutate(removeId)}
      />
    </div>
  )
}
