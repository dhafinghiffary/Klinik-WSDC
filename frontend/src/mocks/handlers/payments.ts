import { http, HttpResponse } from "msw"
import { payments, medicalRecords, patients, doctors, nextId, accountFromRequest } from "../data"
import type { Payment, PaymentDetail, PaymentFormData } from "@/types/payment"

const API = import.meta.env.VITE_API_BASE_URL

const notFound = () =>
  HttpResponse.json({ success: false, message: "Data tidak ditemukan." }, { status: 404 })

export const paymentHandlers = [
  http.get(`${API}/payments`, ({ request }) => {
    const url = new URL(request.url)
    const dateFrom = url.searchParams.get("date_from")
    const dateTo = url.searchParams.get("date_to")
    const method = url.searchParams.get("payment_method")
    const search = (url.searchParams.get("search") ?? "").toLowerCase()
    const page = Number(url.searchParams.get("page") ?? 1)
    const perPage = Number(url.searchParams.get("per_page") ?? 15)

    const filtered = payments.filter((p) => {
      const date = p.paid_at.slice(0, 10)
      const matchFrom = !dateFrom || date >= dateFrom
      const matchTo = !dateTo || date <= dateTo
      const matchMethod = !method || p.payment_method === method
      const matchSearch =
        !search ||
        (p.patient?.name.toLowerCase().includes(search) ?? false) ||
        p.invoice_number.toLowerCase().includes(search)
      return matchFrom && matchTo && matchMethod && matchSearch
    })

    const start = (page - 1) * perPage
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: filtered.slice(start, start + perPage),
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

  http.get(`${API}/payments/:id`, ({ params }) => {
    const payment = payments.find((p) => p.id === Number(params.id))
    return payment ? HttpResponse.json({ success: true, message: "OK", data: payment }) : notFound()
  }),

  http.post(`${API}/payments`, async ({ request }) => {
    const body = (await request.json()) as PaymentFormData
    const acc = accountFromRequest(request)
    const patient = patients.find((p) => p.id === body.patient_id)
    const mr = body.medical_record_id
      ? medicalRecords.find((m) => m.id === body.medical_record_id)
      : undefined
    const doctor = mr ? doctors.find((d) => d.id === mr.doctor_id) : undefined

    const details: PaymentDetail[] = body.details.map((d) => ({
      treatment_master_id: d.treatment_master_id,
      name: d.name,
      price: d.price,
      quantity: d.quantity,
      subtotal: d.price * d.quantity,
    }))
    const subtotal = details.reduce((s, d) => s + d.subtotal, 0)
    const discountType = body.discount_type ?? null
    const discountValue = body.discount_value ?? 0
    const discount =
      discountType === "percentage" ? Math.round((subtotal * discountValue) / 100) : discountValue
    const total = Math.max(0, subtotal - discount)
    const paid = body.paid_amount
    const change = Math.max(0, paid - total)
    const id = nextId(payments)
    const branch = patient?.home_branch ?? acc?.user.branch ?? { id: 1, name: "WSDC Cabang A", code: "WSA" }
    const now = new Date()

    const payment: Payment = {
      id,
      invoice_number: `INV-${branch.code}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(id).padStart(4, "0")}`,
      patient_id: body.patient_id,
      branch_id: branch.id,
      doctor_id: doctor?.id ?? null,
      medical_record_id: body.medical_record_id ?? null,
      subtotal,
      discount_type: discountType,
      discount_value: discountValue,
      total,
      paid_amount: paid,
      change_amount: change,
      payment_method: body.payment_method,
      status: paid >= total ? "paid" : "partial",
      details,
      paid_at: now.toISOString(),
      created_at: now.toISOString(),
      patient: patient
        ? { id: patient.id, name: patient.name, medical_record_number: patient.medical_record_number }
        : undefined,
      doctor_name: doctor?.name ?? null,
      branch_name: branch.name,
      visit_date: mr?.visit_date ?? null,
    }
    payments.unshift(payment)
    if (mr) mr.has_payment = true

    return HttpResponse.json(
      { success: true, message: "Pembayaran berhasil diproses.", data: payment },
      { status: 201 },
    )
  }),
]
