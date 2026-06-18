import { http, HttpResponse } from "msw"
import { patients, medicalRecords, payments, branches, nextId, accountFromRequest } from "../data"
import type { Patient, PatientFormData } from "@/types/patient"

const API = import.meta.env.VITE_API_BASE_URL

const notFound = () =>
  HttpResponse.json({ success: false, message: "Data tidak ditemukan." }, { status: 404 })

function calcAge(birth: string): number {
  const diff = Date.now() - new Date(birth).getTime()
  return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)))
}

export const patientHandlers = [
  http.get(`${API}/patients`, ({ request }) => {
    const url = new URL(request.url)
    const search = (url.searchParams.get("search") ?? "").toLowerCase()
    const branchId = url.searchParams.get("branch_id")
    const page = Number(url.searchParams.get("page") ?? 1)
    const perPage = Number(url.searchParams.get("per_page") ?? 15)

    const filtered = patients.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.medical_record_number.toLowerCase().includes(search) ||
        (p.nik ?? "").includes(search) ||
        p.phone_number.includes(search)
      const matchBranch = !branchId || p.home_branch.id === Number(branchId)
      return matchSearch && matchBranch
    })

    const start = (page - 1) * perPage
    const pageItems = filtered.slice(start, start + perPage).map((p) => ({
      id: p.id,
      medical_record_number: p.medical_record_number,
      name: p.name,
      birth_date: p.birth_date,
      age: p.age,
      gender: p.gender,
      phone_number: p.phone_number,
      home_branch: p.home_branch,
      created_at: p.created_at,
    }))

    return HttpResponse.json({
      success: true,
      message: "OK",
      data: pageItems,
      meta: {
        pagination: {
          current_page: page,
          per_page: perPage,
          total: filtered.length,
          last_page: Math.max(1, Math.ceil(filtered.length / perPage)),
          from: filtered.length ? start + 1 : 0,
          to: Math.min(start + perPage, filtered.length),
        },
      },
    })
  }),

  http.get(`${API}/patients/:id`, ({ params }) => {
    const patient = patients.find((p) => p.id === Number(params.id))
    return patient ? HttpResponse.json({ success: true, message: "OK", data: patient }) : notFound()
  }),

  http.post(`${API}/patients`, async ({ request }) => {
    const body = (await request.json()) as PatientFormData
    const acc = accountFromRequest(request)
    const branch =
      branches.find((b) => b.id === body.home_branch_id) ?? acc?.user.branch ?? branches[0]
    const id = nextId(patients)
    const now = new Date().toISOString()
    const patient: Patient = {
      id,
      medical_record_number: `${branch.code}-2026-${String(id).padStart(6, "0")}`,
      name: body.name,
      nik: body.nik ?? null,
      birth_place: body.birth_place,
      birth_date: body.birth_date,
      age: calcAge(body.birth_date),
      gender: body.gender,
      address: body.address,
      phone_number: body.phone_number,
      occupation: body.occupation ?? null,
      guardian_name: body.guardian_name ?? null,
      guardian_phone: body.guardian_phone ?? null,
      guardian_relation: body.guardian_relation ?? null,
      drug_allergies: body.drug_allergies ?? null,
      systemic_conditions: body.systemic_conditions ?? null,
      home_branch: { id: branch.id, name: branch.name, code: branch.code },
      stats: { total_visits: 0, last_visit_at: null, total_spent: 0 },
      created_at: now,
      updated_at: now,
    }
    patients.unshift(patient)
    return HttpResponse.json(
      { success: true, message: "Pasien berhasil disimpan.", data: patient },
      { status: 201 },
    )
  }),

  http.put(`${API}/patients/:id`, async ({ params, request }) => {
    const body = (await request.json()) as PatientFormData
    const idx = patients.findIndex((p) => p.id === Number(params.id))
    if (idx < 0) return notFound()
    const existing = patients[idx]
    const updated: Patient = {
      ...existing,
      name: body.name,
      nik: body.nik ?? null,
      birth_place: body.birth_place,
      birth_date: body.birth_date,
      age: calcAge(body.birth_date),
      gender: body.gender,
      address: body.address,
      phone_number: body.phone_number,
      occupation: body.occupation ?? null,
      guardian_name: body.guardian_name ?? null,
      guardian_phone: body.guardian_phone ?? null,
      guardian_relation: body.guardian_relation ?? null,
      drug_allergies: body.drug_allergies ?? null,
      systemic_conditions: body.systemic_conditions ?? null,
      updated_at: new Date().toISOString(),
    }
    patients[idx] = updated
    return HttpResponse.json({ success: true, message: "Pasien berhasil disimpan.", data: updated })
  }),

  http.get(`${API}/patients/:id/history`, ({ params }) => {
    const pid = Number(params.id)
    const items = medicalRecords
      .filter((m) => m.patient_id === pid)
      .map((m) => ({
        id: m.id,
        visit_date: m.visit_date,
        doctor_name: m.doctor_name ?? "",
        treatment_summary: m.treatments.map((t) => t.name).join(", ") || "-",
        payment_status: m.has_payment ? "paid" : null,
      }))
    return HttpResponse.json({ success: true, message: "OK", data: items })
  }),

  http.get(`${API}/patients/:id/medical-records`, ({ params }) => {
    const pid = Number(params.id)
    const items = medicalRecords
      .filter((m) => m.patient_id === pid)
      .map((m) => ({
        id: m.id,
        visit_date: m.visit_date,
        doctor_name: m.doctor_name ?? "",
        diagnosis_summary: m.diagnoses.map((d) => d.description).join(", ") || "-",
        treatment_count: m.treatments.length,
        payment_status: m.has_payment ? "paid" : null,
      }))
    return HttpResponse.json({ success: true, message: "OK", data: items })
  }),

  http.get(`${API}/patients/:id/payments`, ({ params }) => {
    const pid = Number(params.id)
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: payments.filter((p) => p.patient_id === pid),
    })
  }),
]
