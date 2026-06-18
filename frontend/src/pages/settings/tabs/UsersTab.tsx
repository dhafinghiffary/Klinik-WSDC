import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Plus, Power } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { useBranches, useRoles } from "@/hooks/use-master"
import { usersApi } from "@/api/users"
import { getApiErrorMessage } from "@/api/client"
import type { ManagedUser } from "@/types/user"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormState {
  name: string
  email: string
  password: string
  role_id: string
  branch_id: string
}

const empty: FormState = { name: "", email: "", password: "", role_id: "", branch_id: "none" }

export function UsersTab() {
  const qc = useQueryClient()
  const { data: users } = useUsers()
  const { data: roles } = useRoles()
  const { data: branches } = useBranches()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [removeId, setRemoveId] = useState<number | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ["users"] })
  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        email: form.email,
        role_id: Number(form.role_id),
        branch_id: form.branch_id === "none" ? null : Number(form.branch_id),
        ...(form.password ? { password: form.password } : {}),
      }
      return editing ? usersApi.update(editing.id, payload) : usersApi.create(payload)
    },
    onSuccess: () => {
      invalidate()
      setOpen(false)
      toast.success("Pengguna tersimpan.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (id: number) => usersApi.deactivate(id),
    onSuccess: () => {
      invalidate()
      setRemoveId(null)
      toast.success("Pengguna dinonaktifkan.")
    },
  })

  const valid = form.name && form.email && form.role_id && (editing || form.password)

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
          <Plus className="size-4" /> Tambah Pengguna
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Cabang</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="hidden md:table-cell">{u.email}</TableCell>
                <TableCell>{u.role.display_name}</TableCell>
                <TableCell className="hidden md:table-cell">{u.branch?.name ?? "Semua"}</TableCell>
                <TableCell>{u.is_active ? "Aktif" : "Nonaktif"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    onClick={() => {
                      setEditing(u)
                      setForm({
                        name: u.name,
                        email: u.email,
                        password: "",
                        role_id: String(u.role.id),
                        branch_id: u.branch ? String(u.branch.id) : "none",
                      })
                      setOpen(true)
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {u.is_active && (
                    <Button variant="ghost" size="icon" aria-label="Nonaktifkan" onClick={() => setRemoveId(u.id)}>
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
            <DialogTitle>{editing ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nama</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>{editing ? "Password (kosongkan jika tidak diubah)" : "Password"}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={form.role_id} onValueChange={(v) => setForm({ ...form, role_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Cabang</Label>
              <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Semua Cabang (Owner)</SelectItem>
                  {branches?.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => save.mutate()} disabled={!valid || save.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeId != null}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title="Nonaktifkan Pengguna?"
        description="Pengguna ini tidak akan dapat login. Data yang sudah dibuat tidak terhapus."
        confirmLabel="Ya, Nonaktifkan"
        destructive
        onConfirm={() => removeId && remove.mutate(removeId)}
      />
    </div>
  )
}
