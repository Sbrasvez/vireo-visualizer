import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "secondary" | "tertiary";
  loading?: boolean;
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  tertiary: "bg-tertiary/15 text-tertiary-foreground",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
  loading,
}: StatCardProps) {
  return (
    <Card className="border-border/60 hover:shadow-soft transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded-md" />
            ) : (
              <p className="font-display text-3xl font-bold text-foreground leading-none">
                {value}
              </p>
            )}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div
            className={cn(
              "size-10 rounded-xl grid place-items-center shrink-0",
              accentMap[accent],
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
