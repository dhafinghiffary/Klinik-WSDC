import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Plus, Power } from "lucide-react"
import { useDoctors } from "@/hooks/use-master"
import { doctorsApi, type Doctor, type DoctorFormData } from "@/api/master"
import { getApiErrorMessage } from "@/api/client"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const empty: DoctorFormData = { name: "", specialization: "", license_number: "" }

export function DoctorsTab() {
  const qc = useQueryClient()
  const { data: doctors } = useDoctors()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [form, setForm] = useState<DoctorFormData>(empty)
  const [removeId, setRemoveId] = useState<number | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ["doctors"] })
  const save = useMutation({
    mutationFn: () => (editing ? doctorsApi.update(editing.id, form) : doctorsApi.create(form)),
    onSuccess: () => {
      invalidate()
      setOpen(false)
      toast.success("Dokter tersimpan.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (id: number) => doctorsApi.remove(id),
    onSuccess: () => {
      invalidate()
      setRemoveId(null)
      toast.success("Dokter dinonaktifkan.")
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
          <Plus className="size-4" /> Tambah Dokter
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>SIP</TableHead>
              <TableHead className="hidden md:table-cell">Spesialisasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors?.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.license_number ?? "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{d.specialization ?? "-"}</TableCell>
                <TableCell>{d.is_active ? "Aktif" : "Nonaktif"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    onClick={() => {
                      setEditing(d)
                      setForm({
                        name: d.name,
                        specialization: d.specialization ?? "",
                        license_number: d.license_number ?? "",
                      })
                      setOpen(true)
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {d.is_active && (
                    <Button variant="ghost" size="icon" aria-label="Nonaktifkan" onClick={() => setRemoveId(d.id)}>
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
            <DialogTitle>{editing ? "Edit Dokter" : "Tambah Dokter"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nama Dokter</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Nomor SIP</Label>
              <Input value={form.license_number ?? ""} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Spesialisasi</Label>
              <Input value={form.specialization ?? ""} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
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
        title="Nonaktifkan Dokter?"
        description="Dokter tidak akan muncul di pilihan baru. Data lama tetap tersimpan."
        confirmLabel="Ya, Nonaktifkan"
        destructive
        onConfirm={() => removeId && remove.mutate(removeId)}
      />
    </div>
  )
}
