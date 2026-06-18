import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"
import type { DashboardSummary } from "@/types/dashboard"

export const dashboardApi = {
  summary: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary")
    return data.data
  },
}
