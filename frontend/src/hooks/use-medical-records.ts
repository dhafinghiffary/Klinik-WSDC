import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { medicalRecordsApi } from "@/api/medical-records"
import type { MedicalRecordFormData } from "@/types/medical-record"

export function useMedicalRecord(id: number) {
  return useQuery({
    queryKey: ["medical-record", id],
    queryFn: () => medicalRecordsApi.get(id),
    enabled: Number.isFinite(id),
  })
}

export function useSaveMedicalRecord(id?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MedicalRecordFormData) =>
      id ? medicalRecordsApi.update(id, payload) : medicalRecordsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medical-record"] })
      qc.invalidateQueries({ queryKey: ["patient-medical-records"] })
    },
  })
}
