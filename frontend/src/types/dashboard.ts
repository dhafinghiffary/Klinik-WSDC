export interface RevenuePoint {
  label: string
  total: number
}

export interface BranchPerformance {
  branch: string
  appointments: number
  revenue: number
}

/** Ringkasan dashboard — sebagian field hanya relevan untuk role tertentu. */
export interface DashboardSummary {
  today_appointments: number
  today_patients: number
  today_revenue: number
  month_revenue: number
  waiting: number
  in_progress: number
  completed: number
  revenue_series: RevenuePoint[]
  branch_performance: BranchPerformance[]
}
