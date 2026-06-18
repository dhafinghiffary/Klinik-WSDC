interface PagePlaceholderProps {
  title: string
  description?: string
}

/** Placeholder sementara untuk halaman yang belum diimplementasikan. */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">
        {description ?? "Halaman ini siap untuk diimplementasikan."}
      </p>
      <div className="mt-6 rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        TODO: implementasi sesuai docs/wireframe-spec.md
      </div>
    </div>
  )
}
