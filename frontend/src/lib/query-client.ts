import { QueryClient } from "@tanstack/react-query"

/** Konfigurasi global TanStack Query. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 menit dianggap fresh
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
