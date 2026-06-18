import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { ReportData } from "@/types/report"

export interface ReportParams {
  period: "today" | "week" | "month" | "year" | "custom"
  date_from?: string
  date_to?: string
  branch_id?: number
}

export const reportsApi = {
  get: async (params: ReportParams): Promise<ReportData> => {
    const { data } = await apiClient.get<ApiResponse<ReportData>>("/reports", { params })
    return data.data
  },
}
