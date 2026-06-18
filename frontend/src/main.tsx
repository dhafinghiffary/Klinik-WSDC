import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { router } from "@/router"
import { queryClient } from "@/lib/query-client"
import "./index.css"

/** Aktifkan Mock API (MSW) bila VITE_ENABLE_MOCK=true. */
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCK !== "true") return
  const { worker } = await import("@/mocks/browser")
  await worker.start({ onUnhandledRequest: "bypass" })
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </StrictMode>,
  )
})
