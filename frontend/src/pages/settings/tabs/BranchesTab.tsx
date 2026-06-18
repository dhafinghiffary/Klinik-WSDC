import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Plus, Power } from "lucide-react"
import { useBranches } from "@/hooks/use-master"
import { branchesApi, type BranchDetail, type BranchFormData } from "@/api/master"
import { getApiErrorMessage } from "@/api/client"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const empty: BranchFormData = { name: "", code: "", address: "", phone: "" }

export function BranchesTab() {
  const qc = useQueryClient()
  const { data: branches } = useBranches()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BranchDetail | null>(null)
  const [form, setForm] = useState<BranchFormData>(empty)
  const [removeId, setRemoveId] = useState<number | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ["branches"] })

  const save = useMutation({
    mutationFn: () => (editing ? branchesApi.update(editing.id, form) : branchesApi.create(form)),
    onSuccess: () => {
      invalidate()
      setOpen(false)
      toast.success("Cabang tersimpan.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (id: number) => branchesApi.remove(id),
    onSuccess: () => {
      invalidate()
      setRemoveId(null)
      toast.success("Cabang dinonaktifkan.")
    },
  })

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }
  const openEdit = (b: BranchDetail) => {
    setEditing(b)
    setForm({ name: b.name, code: b.code, address: b.address ?? "", phone: b.phone ?? "" })
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Tambah Cabang
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead className="hidden md:table-cell">Alamat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches?.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.code}</TableCell>
                <TableCell className="hidden md:table-cell">{b.address}</TableCell>
                <TableCell>{b.is_active ? "Aktif" : "Nonaktif"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(b)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  {b.is_active && (
                    <Button variant="ghost" size="icon" onClick={() => setRemoveId(b.id)} aria-label="Nonaktifkan">
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
            <DialogTitle>{editing ? "Edit Cabang" : "Tambah Cabang"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nama Cabang</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Kode</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Alamat</Label>
              <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>No. Telepon</Label>
              <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => save.mutate()} disabled={!form.name || !form.code || save.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeId != null}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title="Nonaktifkan Cabang?"
        description="Cabang tidak akan muncul di pilihan baru. Data lama tetap tersimpan."
        confirmLabel="Ya, Nonaktifkan"
        destructive
        onConfirm={() => removeId && remove.mutate(removeId)}
      />
    </div>
  )
}
