import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { appointmentsApi, type AppointmentListParams } from "@/api/appointments"
import type { AppointmentFormData, AppointmentStatus } from "@/types/appointment"

export function useAppointments(params: AppointmentListParams) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useTodayAppointments() {
  return useQuery({
    queryKey: ["appointments-today"],
    queryFn: appointmentsApi.today,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AppointmentFormData) => appointmentsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  })
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: number; status: AppointmentStatus }) =>
      appointmentsApi.updateStatus(vars.id, vars.status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] })
      qc.invalidateQueries({ queryKey: ["appointments-today"] })
    },
  })
}
