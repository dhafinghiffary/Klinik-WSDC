import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useOdontogramConditions } from "@/hooks/use-master"
import { conditionsApi, type ConditionFormData, type OdontogramCondition } from "@/api/master"
import { getApiErrorMessage } from "@/api/client"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const empty: ConditionFormData = { name: "", color: "#3b82f6" }

export function ConditionsTab() {
  const qc = useQueryClient()
  const { data: conditions } = useOdontogramConditions()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<OdontogramCondition | null>(null)
  const [form, setForm] = useState<ConditionFormData>(empty)
  const [removeId, setRemoveId] = useState<number | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ["odontogram-conditions"] })
  const save = useMutation({
    mutationFn: () => (editing ? conditionsApi.update(editing.id, form) : conditionsApi.create(form)),
    onSuccess: () => {
      invalidate()
      setOpen(false)
      toast.success("Kondisi tersimpan.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (id: number) => conditionsApi.remove(id),
    onSuccess: () => {
      invalidate()
      setRemoveId(null)
      toast.success("Kondisi dihapus.")
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
          <Plus className="size-4" /> Tambah Kondisi
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Kondisi</TableHead>
              <TableHead>Warna</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conditions?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.code}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 rounded" style={{ backgroundColor: c.color ?? "#999" }} />
                    {c.color}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    onClick={() => {
                      setEditing(c)
                      setForm({ name: c.name, color: c.color ?? "#3b82f6" })
                      setOpen(true)
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Hapus" onClick={() => setRemoveId(c.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Kondisi" : "Tambah Kondisi"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nama Kondisi</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Warna</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="size-10 cursor-pointer rounded border"
                  aria-label="Pilih warna"
                />
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-32" />
              </div>
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
        title="Hapus Kondisi?"
        description="Kondisi odontogram ini akan dihapus permanen."
        confirmLabel="Ya, Hapus"
        destructive
        onConfirm={() => removeId && remove.mutate(removeId)}
      />
    </div>
  )
}
