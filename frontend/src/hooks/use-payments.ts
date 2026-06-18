import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { paymentsApi, type PaymentListParams } from "@/api/payments"
import type { PaymentFormData } from "@/types/payment"

export function usePayments(params: PaymentListParams) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => paymentsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function usePayment(id: number) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => paymentsApi.get(id),
    enabled: Number.isFinite(id),
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PaymentFormData) => paymentsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  })
}
