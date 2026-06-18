import { useQuery } from "@tanstack/react-query"
import { reportsApi, type ReportParams } from "@/api/reports"

export function useReport(params: ReportParams) {
  return useQuery({
    queryKey: ["report", params],
    queryFn: () => reportsApi.get(params),
  })
}
