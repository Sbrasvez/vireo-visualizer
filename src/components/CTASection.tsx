import { useTranslation } from "react-i18next";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <div className="relative rounded-[2rem] gradient-leaf overflow-hidden px-8 py-20 sm:px-16 sm:py-28 text-center shadow-elegant">
          <div className="absolute top-0 right-0 size-96 rounded-full bg-tertiary/20 -translate-y-1/2 translate-x-1/4 blur-2xl animate-float-slow" />
          <div className="absolute bottom-0 left-0 size-72 rounded-full bg-secondary/20 translate-y-1/3 -translate-x-1/4 blur-2xl animate-float" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary-foreground/5" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/15 text-primary-foreground text-sm font-medium mb-8 backdrop-blur-sm">
              <Sparkles className="size-4" />
              <span>{t("cta.badge")}</span>
            </div>

            <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary-foreground/15 mb-8 backdrop-blur-sm animate-pulse-glow">
              <Leaf className="size-10 text-primary-foreground" />
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 text-balance leading-tight">
              {t("cta.title_1")}<br />
              <span className="italic">{t("cta.title_2")}</span>
            </h2>
            <p className="text-primary-foreground/85 text-lg sm:text-xl max-w-xl mx-auto mb-10">
              {t("cta.subtitle_1")}<br />
              {t("cta.subtitle_2")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2 text-base px-8 rounded-xl shadow-warm group" asChild>
                <Link to="/signup">
                  {t("cta.cta_signup")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8 rounded-xl bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                asChild
              >
                <Link to="/recipes">{t("cta.cta_explore")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
