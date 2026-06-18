/** Envelope standar respons API WSDC. Lihat docs/api-contract.md. */

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: {
    pagination: Pagination
  }
}

/** Body error standar (422 menyertakan `errors`). */
export interface ApiErrorBody {
  success: false
  message: string
  errors?: Record<string, string[]>
}
