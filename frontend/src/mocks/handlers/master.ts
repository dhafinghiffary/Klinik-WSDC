import { http, HttpResponse } from "msw"
import {
  branches,
  doctors,
  treatmentMasters,
  odontogramConditions,
  managedUsers,
  roles,
  nextId,
} from "../data"
import type {
  BranchDetail,
  BranchFormData,
  ConditionFormData,
  Doctor,
  DoctorFormData,
  OdontogramCondition,
  TreatmentFormData,
  TreatmentMaster,
} from "@/api/master"
import type { ManagedUser, UserFormData } from "@/types/user"

const API = import.meta.env.VITE_API_BASE_URL

const ok = (data: unknown, message = "OK") =>
  HttpResponse.json({ success: true, message, data })
const created = (data: unknown, message: string) =>
  HttpResponse.json({ success: true, message, data }, { status: 201 })
const notFound = () =>
  HttpResponse.json({ success: false, message: "Data tidak ditemukan." }, { status: 404 })

export const masterHandlers = [
  // ── Reads ──────────────────────────────────────────────
  http.get(`${API}/branches`, () => ok(branches)),
  http.get(`${API}/roles`, () => ok(roles)),
  http.get(`${API}/doctors`, () => ok(doctors)),
  http.get(`${API}/treatment-masters`, () => ok(treatmentMasters)),
  http.get(`${API}/odontogram-conditions`, () => ok(odontogramConditions)),
  http.get(`${API}/users`, () => ok(managedUsers)),

  // ── Branches ───────────────────────────────────────────
  http.post(`${API}/branches`, async ({ request }) => {
    const body = (await request.json()) as BranchFormData
    const branch: BranchDetail = {
      id: nextId(branches),
      name: body.name,
      code: body.code,
      address: body.address ?? null,
      phone: body.phone ?? null,
      is_active: true,
    }
    branches.push(branch)
    return created(branch, "Cabang berhasil ditambahkan.")
  }),
  http.put(`${API}/branches/:id`, async ({ params, request }) => {
    const body = (await request.json()) as BranchFormData
    const b = branches.find((x) => x.id === Number(params.id))
    if (!b) return notFound()
    b.name = body.name
    b.code = body.code
    b.address = body.address ?? null
    b.phone = body.phone ?? null
    return ok(b, "Cabang berhasil diperbarui.")
  }),
  http.delete(`${API}/branches/:id`, ({ params }) => {
    const b = branches.find((x) => x.id === Number(params.id))
    if (!b) return notFound()
    b.is_active = false
    return ok(null, "Cabang dinonaktifkan.")
  }),

  // ── Treatments ─────────────────────────────────────────
  http.post(`${API}/treatment-masters`, async ({ request }) => {
    const body = (await request.json()) as TreatmentFormData
    const id = nextId(treatmentMasters)
    const item: TreatmentMaster = {
      id,
      code: `TKN-${String(id).padStart(3, "0")}`,
      name: body.name,
      price: body.price,
      is_active: true,
    }
    treatmentMasters.push(item)
    return created(item, "Tindakan berhasil ditambahkan.")
  }),
  http.put(`${API}/treatment-masters/:id`, async ({ params, request }) => {
    const body = (await request.json()) as TreatmentFormData
    const t = treatmentMasters.find((x) => x.id === Number(params.id))
    if (!t) return notFound()
    t.name = body.name
    t.price = body.price
    return ok(t, "Tindakan berhasil diperbarui.")
  }),
  http.delete(`${API}/treatment-masters/:id`, ({ params }) => {
    const t = treatmentMasters.find((x) => x.id === Number(params.id))
    if (!t) return notFound()
    t.is_active = false
    return ok(null, "Tindakan dinonaktifkan.")
  }),

  // ── Doctors ────────────────────────────────────────────
  http.post(`${API}/doctors`, async ({ request }) => {
    const body = (await request.json()) as DoctorFormData
    const doctor: Doctor = {
      id: nextId(doctors),
      name: body.name,
      specialization: body.specialization ?? null,
      license_number: body.license_number ?? null,
      is_active: true,
    }
    doctors.push(doctor)
    return created(doctor, "Dokter berhasil ditambahkan.")
  }),
  http.put(`${API}/doctors/:id`, async ({ params, request }) => {
    const body = (await request.json()) as DoctorFormData
    const d = doctors.find((x) => x.id === Number(params.id))
    if (!d) return notFound()
    d.name = body.name
    d.specialization = body.specialization ?? null
    d.license_number = body.license_number ?? null
    return ok(d, "Dokter berhasil diperbarui.")
  }),
  http.delete(`${API}/doctors/:id`, ({ params }) => {
    const d = doctors.find((x) => x.id === Number(params.id))
    if (!d) return notFound()
    d.is_active = false
    return ok(null, "Dokter dinonaktifkan.")
  }),

  // ── Odontogram conditions ──────────────────────────────
  http.post(`${API}/odontogram-conditions`, async ({ request }) => {
    const body = (await request.json()) as ConditionFormData
    const id = nextId(odontogramConditions)
    const item: OdontogramCondition = {
      id,
      code: body.name.slice(0, 3).toUpperCase() || `CND${id}`,
      name: body.name,
      color: body.color,
    }
    odontogramConditions.push(item)
    return created(item, "Kondisi berhasil ditambahkan.")
  }),
  http.put(`${API}/odontogram-conditions/:id`, async ({ params, request }) => {
    const body = (await request.json()) as ConditionFormData
    const c = odontogramConditions.find((x) => x.id === Number(params.id))
    if (!c) return notFound()
    c.name = body.name
    c.color = body.color
    return ok(c, "Kondisi berhasil diperbarui.")
  }),
  http.delete(`${API}/odontogram-conditions/:id`, ({ params }) => {
    const idx = odontogramConditions.findIndex((x) => x.id === Number(params.id))
    if (idx < 0) return notFound()
    odontogramConditions.splice(idx, 1)
    return ok(null, "Kondisi dihapus.")
  }),

  // ── Users ──────────────────────────────────────────────
  http.post(`${API}/users`, async ({ request }) => {
    const body = (await request.json()) as UserFormData
    const user: ManagedUser = {
      id: nextId(managedUsers),
      name: body.name,
      email: body.email,
      role: roles.find((r) => r.id === body.role_id) ?? roles[0],
      branch: branches.find((b) => b.id === body.branch_id) ?? null,
      is_active: true,
    }
    managedUsers.push(user)
    return created(user, "Pengguna berhasil ditambahkan.")
  }),
  http.put(`${API}/users/:id`, async ({ params, request }) => {
    const body = (await request.json()) as UserFormData
    const u = managedUsers.find((x) => x.id === Number(params.id))
    if (!u) return notFound()
    u.name = body.name
    u.email = body.email
    u.role = roles.find((r) => r.id === body.role_id) ?? u.role
    u.branch = branches.find((b) => b.id === body.branch_id) ?? null
    return ok(u, "Pengguna berhasil diperbarui.")
  }),
  http.delete(`${API}/users/:id`, ({ params }) => {
    const u = managedUsers.find((x) => x.id === Number(params.id))
    if (!u) return notFound()
    u.is_active = false
    return ok(null, "Pengguna dinonaktifkan.")
  }),
]
