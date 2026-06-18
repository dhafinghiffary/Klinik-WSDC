import { useQuery } from "@tanstack/react-query"
import { masterApi } from "@/api/master"

export function useBranches() {
  return useQuery({ queryKey: ["branches"], queryFn: masterApi.branches })
}

export function useDoctors(branchId?: number) {
  return useQuery({
    queryKey: ["doctors", branchId ?? null],
    queryFn: () => masterApi.doctors(branchId ? { branch_id: branchId } : {}),
  })
}

export function useTreatments() {
  return useQuery({ queryKey: ["treatments"], queryFn: masterApi.treatments })
}

export function useOdontogramConditions() {
  return useQuery({ queryKey: ["odontogram-conditions"], queryFn: masterApi.odontogramConditions })
}

export function useRoles() {
  return useQuery({ queryKey: ["roles"], queryFn: masterApi.roles })
}
