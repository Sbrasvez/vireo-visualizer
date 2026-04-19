/**
 * QA-only public page to verify Green Score widget translations across the 5
 * supported locales (it/en/es/fr/de) WITHOUT requiring authentication.
 *
 * Shows the same visual structure used in the real <GreenScore /> dashboard
 * widget but driven by hardcoded sample scores instead of the auth-bound
 * useGreenScore() hook. Use the language switcher in the navbar to cycle
 * through locales and verify level names (Germoglio/Seedling/Brote/Germe/
 * Keimling), the "to_next" string with interpolation, the breakdown labels,
 * and the badges.
 *
 * Route: /preview/green-score
 */
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge as UIBadge } from "@/components/ui/badge";
import { GREEN_LEVELS, type GreenLevel } from "@/hooks/useGreenScore";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Sample scores chosen to land in different levels:
//  - 15  → seedling (0–100), with progress towards sprout
//  - 40  → seedling, mid-progress
//  - 65  → seedling, near sprout
//  - 85  → seedling, almost sprout
//  - 180 → sprout
//  - 380 → leaf
//  - 620 → branch
//  - 880 → tree
//  - 1200 → forest (no nextLevel)
const SAMPLES = [15, 40, 65, 85, 180, 380, 620, 880, 1200];

function levelFor(score: number): { level: GreenLevel; nextLevel: GreenLevel | null; progressPct: number } {
  const level = GREEN_LEVELS.find((l) => score >= l.min && score < l.max) ?? GREEN_LEVELS[0];
  const nextIdx = GREEN_LEVELS.indexOf(level) + 1;
  const nextLevel = nextIdx < GREEN_LEVELS.length ? GREEN_LEVELS[nextIdx] : null;
  const progressPct = nextLevel
    ? Math.min(100, Math.round(((score - level.min) / (nextLevel.min - level.min)) * 100))
    : 100;
  return { level, nextLevel, progressPct };
}

const SAMPLE_BADGES = [
  { key: "first_recipe", emoji: "🥗", unlocked: true },
  { key: "explorer", emoji: "🗺️", unlocked: true },
  { key: "reviewer", emoji: "✍️", unlocked: false },
  { key: "shopper", emoji: "🛍️", unlocked: true },
  { key: "collector", emoji: "📚", unlocked: false },
];

export default function PreviewGreenScore() {
  const { t, i18n } = useTranslation();

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">QA · i18n preview</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Green Score — multilingual preview
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Public, auth-free page to verify level names, progress copy, breakdown labels and badges
            in <strong>it / en / es / fr / de</strong>. Use the language switcher to cycle through
            locales — current: <code className="font-mono text-primary">{i18n.language}</code>
          </p>
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLES.map((score) => {
            const { level, nextLevel, progressPct } = levelFor(score);
            return (
              <Card key={score} className="overflow-hidden">
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
                      <div className="text-xs font-semibold mt-0.5">
                        {t(`green_score.levels.${level.key}`)}
                      </div>
                    </div>
                  </div>

                  {nextLevel && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t(`green_score.levels.${level.key}`)}</span>
                        <span>
                          {nextLevel.min - score}{" "}
                          {t("green_score.to_next", {
                            level: t(`green_score.levels.${nextLevel.key}`),
                          })}
                        </span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <Stat label={t("green_score.recipes")} value={3} />
                    <Stat label={t("green_score.reservations")} value={2} />
                    <Stat label={t("green_score.reviews")} value={1} />
                    <Stat label={t("green_score.orders")} value={4} />
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      {t("green_score.badges")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_BADGES.map((b) => (
                        <UIBadge
                          key={b.key}
                          variant={b.unlocked ? "default" : "outline"}
                          className={
                            b.unlocked
                              ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/15"
                              : "opacity-50"
                          }
                        >
                          <span className="mr-1">{b.emoji}</span>
                          {t(`green_score.badge_${b.key}`)}
                        </UIBadge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
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
