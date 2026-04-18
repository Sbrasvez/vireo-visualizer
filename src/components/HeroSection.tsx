import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import CTAButton from "@/components/CTAButton";
import heroImage from "@/assets/home-hero.jpg";

/**
 * Editorial "Tactile Market" hero — warm, magazine-like.
 * Serif display (Fraunces), generous spacing, single hero photo with floating accent card.
 */
export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden pt-24 pb-16 lg:pt-28 lg:pb-24 bg-vireo-cream/40">
      {/* Soft natural decorations */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-24 -left-20 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 -right-10 size-80 rounded-full bg-secondary/15 blur-3xl" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <span
              className="inline-flex items-center gap-2 text-secondary text-[11px] font-bold uppercase tracking-[0.22em] mb-6 border border-secondary/30 px-3 py-1 rounded-full animate-fade-up bg-background/60"
            >
              <Sparkles className="size-3.5" />
              {t("hero.badge", "Cibo vero, zero sprechi")}
            </span>

            <h1
              className="font-display font-normal text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-balance text-foreground mb-6 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              {t("hero.editorial_title_1", "La natura,")}{" "}
              <br className="hidden md:block" />
              <span className="italic text-primary">
                {t("hero.editorial_title_2", "sulla tua tavola.")}
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-[48ch] mb-10 leading-relaxed animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              {t(
                "hero.editorial_lead",
                "Unisciti al mercato sostenibile. Scopri produttori locali, salva il cibo in eccesso e cucina con l'aiuto di un assistente AI che pensa come te.",
              )}
            </p>

            <div
              className="flex flex-wrap items-center gap-4 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <CTAButton size="lg" asChild>
                <Link to="/signup">
                  {t("hero.cta_start", "Inizia gratis")}
                  <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
                </Link>
              </CTAButton>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-base px-8 rounded-full border-foreground/15 hover:bg-vireo-cream/60"
                asChild
              >
                <Link to="/recipes">{t("hero.cta_explore", "Esplora ricette")}</Link>
              </Button>
            </div>

            {/* Stats — quiet, editorial */}
            <div
              className="grid grid-cols-3 gap-6 mt-14 max-w-lg w-full animate-fade-up"
              style={{ animationDelay: "0.45s" }}
            >
              {[
                { value: "2k+", label: t("hero.stat_recipes", "Ricette") },
                { value: "500+", label: t("hero.stat_restaurants", "Ristoranti") },
                { value: "10k+", label: t("hero.stat_users", "Utenti") },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div
            className="lg:col-span-6 relative animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative aspect-[4/5] md:aspect-square w-full max-w-xl mx-auto">
              <div className="absolute -inset-4 bg-primary/10 rounded-[2.5rem] blur-2xl opacity-60" />
              <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden ring-1 ring-foreground/5 shadow-elegant">
                <img
                  src={heroImage}
                  alt={t(
                    "hero.image_alt",
                    "Tavolo rustico con verdure di stagione, erbe aromatiche e ceramica artigianale",
                  )}
                  className="w-full h-full object-cover"
                  width={1024}
                  height={1024}
                />
              </div>

              {/* Floating editorial card */}
              <div className="absolute -bottom-5 -left-3 sm:bottom-8 sm:-left-10 bg-background/95 backdrop-blur p-4 sm:p-5 rounded-2xl border border-border shadow-elegant max-w-[260px] animate-float">
                <div className="text-[10px] sm:text-xs text-secondary font-bold uppercase tracking-[0.2em] mb-1.5">
                  {t("hero.harvest_badge", "Raccolto di oggi")}
                </div>
                <div className="text-sm sm:text-base text-foreground font-medium leading-snug">
                  {t(
                    "hero.harvest_text",
                    "Pomodori cuore di bue e basilico fresco, direttamente dai nostri produttori locali.",
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
