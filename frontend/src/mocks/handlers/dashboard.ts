import { http, HttpResponse } from "msw"
import { accountFromRequest } from "../data"
import type { DashboardSummary } from "@/types/dashboard"

const API = import.meta.env.VITE_API_BASE_URL

export const dashboardHandlers = [
  http.get(`${API}/dashboard/summary`, ({ request }) => {
    const acc = accountFromRequest(request)
    const role = acc?.user.role.name

    const summary: DashboardSummary = {
      today_appointments: 4,
      today_patients: 3,
      today_revenue: 650000,
      month_revenue: 18500000,
      waiting: 2,
      in_progress: 1,
      completed: 1,
      revenue_series: [
        { label: "Sen", total: 2400000 },
        { label: "Sel", total: 1800000 },
        { label: "Rab", total: 3200000 },
        { label: "Kam", total: 2100000 },
        { label: "Jum", total: 2800000 },
        { label: "Sab", total: 3500000 },
        { label: "Min", total: 650000 },
      ],
      branch_performance:
        role === "owner"
          ? [
              { branch: "WSDC Cabang A", appointments: 8, revenue: 2500000 },
              { branch: "WSDC Cabang B", appointments: 10, revenue: 3000000 },
              { branch: "WSDC Cabang C", appointments: 6, revenue: 2000000 },
            ]
          : [],
    }

    return HttpResponse.json({ success: true, message: "OK", data: summary })
  }),
]
