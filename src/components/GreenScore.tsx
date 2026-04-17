import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGreenScore } from "@/hooks/useGreenScore";

export function GreenScore() {
  const { t } = useTranslation();
  const { score, level, nextLevel, progressPct, badges, loading, breakdown } = useGreenScore();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              {t("green_score.title")}
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="font-display text-4xl font-bold text-primary">{score}</span>
              <span className="text-sm text-muted-foreground">{t("green_score.points")}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl">{level.emoji}</div>
            <div className="text-xs font-semibold mt-0.5">{t(`green_score.levels.${level.key}`)}</div>
          </div>
        </div>

        {nextLevel && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t(`green_score.levels.${level.key}`)}</span>
              <span>
                {nextLevel.min - score} {t("green_score.to_next", { level: t(`green_score.levels.${nextLevel.key}`) })}
              </span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        )}

        {/* Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <Stat label={t("green_score.recipes")} value={breakdown.savedRecipes} />
          <Stat label={t("green_score.reservations")} value={breakdown.reservations} />
          <Stat label={t("green_score.reviews")} value={breakdown.reviews} />
          <Stat label={t("green_score.orders")} value={breakdown.orders} />
        </div>

        {/* Badges */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">{t("green_score.badges")}</div>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <Badge
                key={b.key}
                variant={b.unlockedAt ? "default" : "outline"}
                className={b.unlockedAt ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/15" : "opacity-50"}
              >
                <span className="mr-1">{b.emoji}</span>
                {t(`green_score.badge_${b.key}`)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-accent/40 px-3 py-2">
      <div className="font-display text-lg font-bold text-primary">{value}</div>
      <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
    </div>
  );
}
