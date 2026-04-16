import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-border/60", className)}>
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
      </div>
    </Card>
  );
}
