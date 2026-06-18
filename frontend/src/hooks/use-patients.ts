import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { patientsApi, type PatientListParams } from "@/api/patients"
import type { PatientFormData } from "@/types/patient"

export function usePatients(params: PatientListParams) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => patientsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => patientsApi.get(id),
    enabled: Number.isFinite(id),
  })
}

export function usePatientHistory(id: number) {
  return useQuery({
    queryKey: ["patient-history", id],
    queryFn: () => patientsApi.history(id),
    enabled: Number.isFinite(id),
  })
}

export function usePatientMedicalRecords(id: number) {
  return useQuery({
    queryKey: ["patient-medical-records", id],
    queryFn: () => patientsApi.medicalRecords(id),
    enabled: Number.isFinite(id),
  })
}

export function usePatientPayments(id: number) {
  return useQuery({
    queryKey: ["patient-payments", id],
    queryFn: () => patientsApi.payments(id),
    enabled: Number.isFinite(id),
  })
}

export function useSavePatient(id?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PatientFormData) =>
      id ? patientsApi.update(id, payload) : patientsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] })
      if (id) qc.invalidateQueries({ queryKey: ["patient", id] })
    },
  })
}
