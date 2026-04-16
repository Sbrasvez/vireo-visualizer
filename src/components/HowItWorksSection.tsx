import { useTranslation } from "react-i18next";
import { Search, ChefHat, Leaf } from "lucide-react";

export default function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    { icon: Search, number: "01", title: t("how.step1_title"), description: t("how.step1_desc") },
    { icon: ChefHat, number: "02", title: t("how.step2_title"), description: t("how.step2_desc") },
    { icon: Leaf, number: "03", title: t("how.step3_title"), description: t("how.step3_desc") },
  ];

  return (
    <section className="py-24 sm:py-32 bg-muted/40 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">{t("how.kicker")}</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5 text-balance">
            {t("how.title_1")} <span className="italic text-gradient-warm">{t("how.title_2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg">{t("how.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {steps.map((s, i) => (
            <div
              key={s.number}
              className="relative text-center animate-fade-up"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="relative inline-flex mb-6">
                <div className="size-24 rounded-3xl gradient-leaf flex items-center justify-center shadow-elegant">
                  <s.icon className="size-10 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 size-9 rounded-full bg-secondary text-secondary-foreground font-display font-bold text-sm flex items-center justify-center shadow-warm">
                  {s.number}
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
