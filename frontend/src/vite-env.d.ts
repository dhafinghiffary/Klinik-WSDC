/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** "true" untuk mengaktifkan Mock API (MSW). */
  readonly VITE_ENABLE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
