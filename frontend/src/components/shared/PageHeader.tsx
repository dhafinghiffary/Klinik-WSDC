import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  backTo?: string
  backLabel?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, backTo, backLabel, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> {backLabel ?? "Kembali"}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
