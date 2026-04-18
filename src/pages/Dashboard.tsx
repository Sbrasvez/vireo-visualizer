import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChefHat,
  Calendar,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  MapPin,
  Star,
  Leaf,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { CO2Tracker } from "@/components/CO2Tracker";
import { GreenScore } from "@/components/GreenScore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CTAButton from "@/components/CTAButton";
import { Badge } from "@/components/ui/badge";
import MotionCard from "@/components/MotionCard";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRestaurants } from "@/hooks/useRestaurants";

// Curated recommended recipes (placeholder until Spoonacular import in Sprint 2)
const RECOMMENDED_RECIPES = [
  {
    id: "r1",
    title: "Buddha bowl di farro e ceci croccanti",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=70",
    time: 25,
    diet: "Vegano",
    leaves: 5,
  },
  {
    id: "r2",
    title: "Pasta fredda al pesto di basilico e zucchine",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=70",
    time: 20,
    diet: "Vegetariano",
    leaves: 4,
  },
  {
    id: "r3",
    title: "Curry di lenticchie rosse e latte di cocco",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=70",
    time: 35,
    diet: "Vegano",
    leaves: 5,
  },
  {
    id: "r4",
    title: "Insalata di farro, melagrana e feta",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=70",
    time: 15,
    diet: "Vegetariano",
    leaves: 4,
  },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { plan, isPro } = usePlan();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { restaurants } = useRestaurants();
  const [displayName, setDisplayName] = useState<string | undefined>();

  const getGreeting = (name?: string) => {
    const h = new Date().getHours();
    const greet = h < 12 ? t("dashboard.good_morning") : h < 18 ? t("dashboard.good_afternoon") : t("dashboard.good_evening");
    return name ? `${greet}, ${name}` : `${greet}`;
  };

  useEffect(() => {
    const meta = (user?.user_metadata as { display_name?: string; full_name?: string }) || {};
    setDisplayName(meta.display_name || meta.full_name || user?.email?.split("@")[0]);
  }, [user]);

  const nearbyRestaurants = restaurants.slice(0, 3);

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-10 space-y-12">
        {/* Editorial greeting */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
              — {today}
            </span>
            <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase hidden sm:inline">
              {t("dashboard.eyebrow", "Il tuo diario sostenibile")}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-[1.05]">
            {getGreeting(displayName)},{" "}
            <em className="italic text-primary not-italic font-display">
              {t("dashboard.greeting_em", "buon ritorno.")}
            </em>
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">{t("dashboard.subtitle")}</p>
        </section>

        {/* Stats */}
        <section className="space-y-4">
          <div className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
            — {t("dashboard.stats_eyebrow", "Il tuo impatto")}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t("dashboard.saved_recipes")} value={stats.savedRecipes} icon={ChefHat} accent="primary" loading={statsLoading} />
            <StatCard label={t("dashboard.reservations")} value={stats.reservations} icon={Calendar} accent="secondary" loading={statsLoading} />
            <StatCard label={t("dashboard.orders")} value={stats.orders} hint={t("dashboard.marketplace_hint")} icon={ShoppingBag} accent="tertiary" loading={statsLoading} />
            <StatCard label={t("dashboard.co2_saved")} value={`${stats.co2KgSaved} kg`} hint={t("dashboard.co2_hint")} icon={Leaf} accent="primary" loading={statsLoading} />
          </div>
        </section>

        {/* CO2 + Green Score */}
        <section className="space-y-4">
          <div className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
            — {t("dashboard.tracker_eyebrow", "Misura ciò che conta")}
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <CO2Tracker />
            <GreenScore />
          </div>
        </section>

        {/* Upgrade banner */}
        {!isPro && (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-background to-tertiary/10 overflow-hidden">
            <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center shrink-0">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary mb-1.5">
                    — {t("dashboard.pro_eyebrow", "Passa a Pro")}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-semibold mb-1 leading-tight">
                    {t("dashboard.upgrade_title")}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">{t("dashboard.upgrade_desc")}</p>
                </div>
              </div>
              <CTAButton asChild size="md" className="shrink-0">
                <Link to="/pricing">
                  {t("dashboard.discover_pro")} <ArrowRight className="size-4 ml-1" />
                </Link>
              </CTAButton>
            </CardContent>
          </Card>
        )}

        {/* Recommended recipes */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase mb-2">
                — {t("dashboard.recipes_eyebrow", "Selezione del giorno")}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">
                {t("dashboard.recommended_recipes")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t("dashboard.recommended_desc")}</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link to="/recipes">
                {t("dashboard.all")} <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RECOMMENDED_RECIPES.map((r, i) => (
              <MotionCard
                key={r.id}
                delay={i * 0.05}
                lift="medium"
                className="overflow-hidden border border-border/60 bg-card cursor-pointer group rounded-xl"
              >
                <div
                  className="aspect-[4/3] bg-muted bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url(${r.image})` }}
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: r.leaves }).map((_, idx) => (
                      <Leaf key={idx} className="size-3 text-primary fill-primary/30" />
                    ))}
                  </div>
                  <h3 className="font-display font-medium text-sm leading-snug line-clamp-2">{r.title}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono tracking-wide">{r.time} min</span>
                    <Badge variant="secondary" className="text-[10px] font-mono uppercase tracking-wider">
                      {r.diet}
                    </Badge>
                  </div>
                </div>
              </MotionCard>
            ))}
          </div>
        </section>

        {/* Nearby restaurants */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase mb-2">
                — {t("dashboard.places_eyebrow", "Luoghi vicini")}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">
                {t("dashboard.nearby_restaurants")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t("dashboard.nearby_desc")}</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link to="/restaurants">
                {t("dashboard.explore_map")} <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
          {nearbyRestaurants.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyRestaurants.map((r, i) => (
                <MotionCard
                  key={r.id}
                  delay={i * 0.06}
                  lift="medium"
                  className="overflow-hidden border border-border/60 bg-card h-full rounded-xl"
                >
                  <Link to="/restaurants" className="group block h-full">
                    <div
                      className="aspect-[16/10] bg-muted bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: r.cover_image
                          ? `url(${r.cover_image})`
                          : "linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--tertiary)/0.2))",
                      }}
                    />
                    <div className="p-4 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-base font-semibold leading-tight line-clamp-1">
                          {r.name}
                        </h3>
                        <span className="font-mono text-xs font-medium text-muted-foreground shrink-0 tracking-wider">
                          {r.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="size-3 fill-tertiary text-tertiary" />
                          <span className="font-mono">{r.rating?.toFixed(1) ?? "—"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {r.city}
                        </span>
                      </div>
                      {r.short_description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                          {r.short_description}
                        </p>
                      )}
                    </div>
                  </Link>
                </MotionCard>
              ))}
            </div>
          )}
        </section>

        {/* Plan note */}
        {plan && (
          <p className="text-xs text-muted-foreground text-center pt-4 font-mono tracking-wide">
            {t("dashboard.active_plan")}:{" "}
            <span className="font-semibold capitalize text-foreground">{plan.tier}</span>
            {plan.tier === "free" && ` · ${t("dashboard.free_plan_hint")}`}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
