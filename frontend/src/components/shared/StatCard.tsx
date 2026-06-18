import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          {Icon && (
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Icon className="size-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
