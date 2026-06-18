import { http, HttpResponse } from "msw"
import type { ReportData } from "@/types/report"

const API = import.meta.env.VITE_API_BASE_URL

export const reportHandlers = [
  http.get(`${API}/reports`, () => {
    const data: ReportData = {
      summary: {
        total_revenue: 45000000,
        total_transactions: 120,
        new_patients: 35,
        returning_patients: 50,
      },
      revenue_trend: [
        { label: "Jan", total: 12000000 },
        { label: "Feb", total: 14500000 },
        { label: "Mar", total: 13200000 },
        { label: "Apr", total: 16800000 },
        { label: "Mei", total: 15300000 },
        { label: "Jun", total: 18500000 },
      ],
      by_branch: [
        { label: "WSDC Cabang A", total: 20000000 },
        { label: "WSDC Cabang B", total: 15000000 },
        { label: "WSDC Cabang C", total: 10000000 },
      ],
      by_doctor: [
        { label: "drg. Budi Santoso", total: 18000000 },
        { label: "drg. Citra Dewi", total: 15000000 },
        { label: "drg. Ayu Pratiwi", total: 12000000 },
      ],
    }
    return HttpResponse.json({ success: true, message: "OK", data })
  }),
]
