import { http, HttpResponse } from "msw"
import { patients, doctors, nextId } from "../data"
import type { Appointment, AppointmentFormData, AppointmentStatus } from "@/types/appointment"

const API = import.meta.env.VITE_API_BASE_URL
const today = new Date().toISOString().slice(0, 10)

function patientRef(id: number) {
  const p = patients.find((x) => x.id === id) ?? patients[0]
  return { id: p.id, name: p.name, medical_record_number: p.medical_record_number, phone_number: p.phone_number }
}

const appointments: Appointment[] = [
  {
    id: 1, scheduled_at: `${today}T09:00:00Z`, status: "checked_in", notes: "Kontrol rutin",
    patient: patientRef(1), doctor: { id: 3, name: "drg. Budi Santoso" }, branch: { id: 1, name: "WSDC Cabang A" },
    created_at: `${today}T07:00:00Z`,
  },
  {
    id: 2, scheduled_at: `${today}T09:30:00Z`, status: "scheduled", notes: null,
    patient: patientRef(4), doctor: { id: 3, name: "drg. Budi Santoso" }, branch: { id: 1, name: "WSDC Cabang A" },
    created_at: `${today}T07:00:00Z`,
  },
  {
    id: 3, scheduled_at: `${today}T10:00:00Z`, status: "completed", notes: "Cabut gigi",
    patient: patientRef(2), doctor: { id: 4, name: "drg. Citra Dewi" }, branch: { id: 1, name: "WSDC Cabang A" },
    created_at: `${today}T07:00:00Z`,
  },
  {
    id: 4, scheduled_at: `${today}T10:30:00Z`, status: "scheduled", notes: null,
    patient: patientRef(5), doctor: { id: 3, name: "drg. Budi Santoso" }, branch: { id: 2, name: "WSDC Cabang B" },
    created_at: `${today}T07:00:00Z`,
  },
]

function listResponse(items: Appointment[]) {
  return HttpResponse.json({
    success: true,
    message: "OK",
    data: items,
    meta: {
      pagination: {
        current_page: 1, per_page: 50, total: items.length, last_page: 1,
        from: items.length ? 1 : 0, to: items.length,
      },
    },
  })
}

export const appointmentHandlers = [
  http.get(`${API}/appointments/today`, () =>
    HttpResponse.json({ success: true, message: "OK", data: appointments }),
  ),

  http.get(`${API}/appointments`, ({ request }) => {
    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    const doctorId = url.searchParams.get("doctor_id")
    const status = url.searchParams.get("status")

    const filtered = appointments.filter((a) => {
      const matchDate = !date || a.scheduled_at.slice(0, 10) === date
      const matchDoctor = !doctorId || a.doctor.id === Number(doctorId)
      const matchStatus = !status || a.status === status
      return matchDate && matchDoctor && matchStatus
    })
    return listResponse(filtered)
  }),

  http.get(`${API}/appointments/:id`, ({ params }) => {
    const appt = appointments.find((a) => a.id === Number(params.id))
    return appt
      ? HttpResponse.json({ success: true, message: "OK", data: appt })
      : HttpResponse.json({ success: false, message: "Data tidak ditemukan." }, { status: 404 })
  }),

  http.post(`${API}/appointments`, async ({ request }) => {
    const body = (await request.json()) as AppointmentFormData
    const doctor = doctors.find((d) => d.id === body.doctor_id)
    const appt: Appointment = {
      id: nextId(appointments),
      scheduled_at: body.scheduled_at,
      status: "scheduled",
      notes: body.notes ?? null,
      patient: patientRef(body.patient_id),
      doctor: { id: body.doctor_id, name: doctor?.name ?? "Dokter" },
      branch: { id: body.branch_id, name: `WSDC Cabang ${body.branch_id}` },
      created_at: new Date().toISOString(),
    }
    appointments.push(appt)
    return HttpResponse.json(
      { success: true, message: "Booking berhasil dibuat.", data: appt },
      { status: 201 },
    )
  }),

  http.patch(`${API}/appointments/:id/status`, async ({ params, request }) => {
    const body = (await request.json()) as { status: AppointmentStatus }
    const appt = appointments.find((a) => a.id === Number(params.id))
    if (!appt) {
      return HttpResponse.json({ success: false, message: "Data tidak ditemukan." }, { status: 404 })
    }
    appt.status = body.status
    return HttpResponse.json({ success: true, message: "Status diperbarui.", data: appt })
  }),
]
