import { apiClient } from "./client"
import type { ApiResponse } from "@/types/api"

export interface RevenuePoint {
  label: string
  total: number
}

export interface RevenueReport {
  total_revenue: number
  total_transactions: number
  series: RevenuePoint[]
}

export interface RevenueReportParams {
  period: "daily" | "monthly" | "yearly"
  date_from?: string
  date_to?: string
  branch_id?: number
}

export const reportsApi = {
  revenue: async (params: RevenueReportParams): Promise<RevenueReport> => {
    const { period, ...query } = params
    const { data } = await apiClient.get<ApiResponse<RevenueReport>>(`/reports/revenue/${period}`, {
      params: query,
    })
    return data.data
  },

  revenueByDoctor: async (params: Omit<RevenueReportParams, "period">): Promise<RevenuePoint[]> => {
    const { data } = await apiClient.get<ApiResponse<RevenuePoint[]>>("/reports/revenue/by-doctor", {
      params,
    })
    return data.data
  },

  revenueByBranch: async (params: Omit<RevenueReportParams, "period">): Promise<RevenuePoint[]> => {
    const { data } = await apiClient.get<ApiResponse<RevenuePoint[]>>("/reports/revenue/by-branch", {
      params,
    })
    return data.data
  },
}
