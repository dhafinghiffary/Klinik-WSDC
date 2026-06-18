import { http, HttpResponse } from "msw"
import { medicalRecords, patients, doctors, nextId, accountFromRequest } from "../data"
import type { MedicalRecord, MedicalRecordFormData } from "@/types/medical-record"

const API = import.meta.env.VITE_API_BASE_URL

const notFound = () =>
  HttpResponse.json({ success: false, message: "Data tidak ditemukan." }, { status: 404 })

export const medicalRecordHandlers = [
  http.get(`${API}/medical-records/:id`, ({ params }) => {
    const rec = medicalRecords.find((m) => m.id === Number(params.id))
    return rec ? HttpResponse.json({ success: true, message: "OK", data: rec }) : notFound()
  }),

  http.post(`${API}/medical-records`, async ({ request }) => {
    const body = (await request.json()) as MedicalRecordFormData
    const acc = accountFromRequest(request)
    const patient = patients.find((p) => p.id === body.patient_id)
    const doctorId = acc?.user.role.name === "doctor" ? acc.user.id : 3
    const doctor = doctors.find((d) => d.id === doctorId) ?? doctors[0]
    const id = nextId(medicalRecords)
    const now = new Date().toISOString()
    const rec: MedicalRecord = {
      id,
      patient_id: body.patient_id,
      doctor_id: doctor.id,
      branch_id: patient?.home_branch.id ?? 1,
      visit_date: body.visit_date,
      anamnesis: body.anamnesis,
      additional_notes: body.additional_notes ?? null,
      diagnoses: body.diagnoses,
      treatments: body.treatments,
      prescriptions: body.prescriptions,
      odontograms: body.odontograms,
      photos: [],
      created_at: now,
      updated_at: now,
      patient: patient
        ? {
            id: patient.id,
            name: patient.name,
            medical_record_number: patient.medical_record_number,
            drug_allergies: patient.drug_allergies,
          }
        : undefined,
      doctor_name: doctor.name,
      branch_name: patient?.home_branch.name ?? "WSDC",
      has_payment: false,
    }
    medicalRecords.push(rec)
    return HttpResponse.json(
      { success: true, message: "Rekam medis berhasil disimpan.", data: rec },
      { status: 201 },
    )
  }),

  http.put(`${API}/medical-records/:id`, async ({ params, request }) => {
    const body = (await request.json()) as MedicalRecordFormData
    const idx = medicalRecords.findIndex((m) => m.id === Number(params.id))
    if (idx < 0) return notFound()
    medicalRecords[idx] = {
      ...medicalRecords[idx],
      visit_date: body.visit_date,
      anamnesis: body.anamnesis,
      additional_notes: body.additional_notes ?? null,
      diagnoses: body.diagnoses,
      treatments: body.treatments,
      prescriptions: body.prescriptions,
      odontograms: body.odontograms,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json({
      success: true,
      message: "Rekam medis berhasil diperbarui.",
      data: medicalRecords[idx],
    })
  }),

  http.post(`${API}/medical-records/:id/photos`, () =>
    HttpResponse.json({ success: true, message: "Foto berhasil diunggah.", data: null }),
  ),
]
