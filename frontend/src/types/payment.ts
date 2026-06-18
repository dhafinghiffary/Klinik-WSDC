export type PaymentMethod = "cash" | "transfer"
export type PaymentStatus = "paid" | "partial" | "unpaid"
export type DiscountType = "percentage" | "nominal"

export interface PaymentDetail {
  id?: number
  treatment_master_id: number | null
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface Payment {
  id: number
  invoice_number: string
  patient_id: number
  branch_id: number
  doctor_id: number | null
  medical_record_id: number | null
  subtotal: number
  discount_type: DiscountType | null
  discount_value: number
  total: number
  paid_amount: number
  change_amount: number
  payment_method: PaymentMethod
  status: PaymentStatus
  details: PaymentDetail[]
  paid_at: string
  created_at: string
}

/** Payload create pembayaran. */
export interface PaymentFormData {
  patient_id: number
  medical_record_id?: number | null
  details: Array<{ treatment_master_id: number | null; name: string; price: number; quantity: number }>
  discount_type?: DiscountType | null
  discount_value?: number
  payment_method: PaymentMethod
  paid_amount: number
}
