import { Sparkles, Crown, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanTier } from "@/hooks/usePlan";

interface PlanBadgeProps {
  tier: PlanTier;
  className?: string;
}

const config = {
  free: { label: "Free", icon: Leaf, classes: "bg-muted text-muted-foreground" },
  pro: {
    label: "Pro",
    icon: Sparkles,
    classes: "bg-primary/10 text-primary border border-primary/30",
  },
  business: {
    label: "Business",
    icon: Crown,
    classes: "bg-tertiary/15 text-tertiary-foreground border border-tertiary/40",
  },
} as const;

export function PlanBadge({ tier, className }: PlanBadgeProps) {
  const c = config[tier];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        c.classes,
        className,
      )}
    >
      <Icon className="size-3" />
      {c.label}
    </span>
  );
}
