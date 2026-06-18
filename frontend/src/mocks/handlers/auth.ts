import { http, HttpResponse } from "msw"
import { accounts, accountByToken } from "../data"

const API = import.meta.env.VITE_API_BASE_URL

export const authHandlers = [
  http.post(`${API}/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    const account = accounts[(body.email ?? "").toLowerCase().trim()]

    if (!account || account.password !== body.password) {
      return HttpResponse.json(
        { success: false, message: "Email atau password salah." },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      success: true,
      message: "Login berhasil.",
      data: { token: account.token, user: account.user },
    })
  }),

  http.post(`${API}/logout`, () => {
    return HttpResponse.json({ success: true, message: "Logout berhasil." })
  }),

  http.put(`${API}/me/password`, () => {
    return HttpResponse.json({ success: true, message: "Password berhasil diubah.", data: null })
  }),

  http.get(`${API}/me`, ({ request }) => {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    const account = token ? accountByToken[token] : undefined

    if (!account) {
      return HttpResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 })
    }

    return HttpResponse.json({ success: true, message: "OK", data: account.user })
  }),
]
