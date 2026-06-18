import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Search, UserRound } from "lucide-react"
import { usePatients } from "@/hooks/use-patients"
import { useBranches } from "@/hooks/use-master"
import { useAuthStore } from "@/stores/auth-store"
import { ROLES } from "@/constants/roles"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PER_PAGE = 10

export default function PatientListPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role.name === ROLES.ADMIN
  const isOwner = user?.role.name === ROLES.OWNER

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [branchFilter, setBranchFilter] = useState("all")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data: branches } = useBranches()
  const { data, isLoading, isError } = usePatients({
    search,
    branch_id: branchFilter === "all" ? undefined : Number(branchFilter),
    page,
    per_page: PER_PAGE,
  })

  const patients = data?.data ?? []
  const pagination = data?.meta.pagination

  return (
    <div>
      <PageHeader
        title="Daftar Pasien"
        description="Cari dan kelola data pasien klinik."
        actions={
          isAdmin && (
            <Button asChild>
              <Link to="/patients/create">
                <Plus className="size-4" /> Tambah Pasien
              </Link>
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari nama, no. RM, NIK, atau HP..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        {isOwner && (
          <Select value={branchFilter} onValueChange={(v) => { setBranchFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Semua Cabang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Cabang</SelectItem>
              {branches?.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. RM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Usia</TableHead>
                <TableHead className="hidden md:table-cell">Jenis Kelamin</TableHead>
                <TableHead className="hidden md:table-cell">No. HP</TableHead>
                <TableHead className="hidden lg:table-cell">Cabang</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {isError && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-destructive">
                    Gagal memuat data pasien.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && patients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={UserRound}
                      title={search ? "Tidak ada pasien ditemukan" : "Belum ada pasien terdaftar"}
                      description={
                        search
                          ? "Coba kata kunci lain."
                          : "Mulai dengan menambahkan pasien baru."
                      }
                    />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                patients.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{p.medical_record_number}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.age} th</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.gender === "male" ? "Laki-laki" : "Perempuan"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{p.phone_number}</TableCell>
                    <TableCell className="hidden lg:table-cell">{p.home_branch.name}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && pagination.total > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span>
            Menampilkan {pagination.from}–{pagination.to} dari {pagination.total} pasien
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
  )
}
