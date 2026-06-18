import type { RevenuePoint } from "./dashboard"

export interface ReportSummary {
  total_revenue: number
  total_transactions: number
  new_patients: number
  returning_patients: number
}

export interface ReportData {
  summary: ReportSummary
  revenue_trend: RevenuePoint[]
  by_branch: RevenuePoint[]
  by_doctor: RevenuePoint[]
}
