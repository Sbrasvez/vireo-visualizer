import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import marketImg from "@/assets/home-marketplace.jpg";
import surplusImg from "@/assets/home-surplus.jpg";
import recipesImg from "@/assets/home-recipes.jpg";
import restaurantsImg from "@/assets/home-restaurants.jpg";
import communityImg from "@/assets/home-community.jpg";

type Section = {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  image?: string;
  variant: "photo" | "ai" | "feature";
  accent?: "leaf" | "terracotta" | "sun";
};

/**
 * "Tactile Market" — six editorial cards that map to the six core areas of Vireo.
 * Mix of photo cards, an AI chat card, and a hero feature card.
 */
export default function HomeSections() {
  const { t } = useTranslation();

  const sections: Section[] = [
    {
      href: "/marketplace",
      eyebrow: t("home.section.market_eyebrow", "Il Mercato"),
      title: t("home.section.market_title", "Produttori diretti"),
      body: t(
        "home.section.market_body",
        "Compra radici, foglie e semi direttamente da chi coltiva la terra. Senza intermediari.",
      ),
      image: marketImg,
      variant: "photo",
      accent: "leaf",
    },
    {
      href: "/surplus",
      eyebrow: t("home.section.surplus_eyebrow", "Dispensa Magica"),
      title: t("home.section.surplus_title", "Salva il raccolto"),
      body: t(
        "home.section.surplus_body",
        "Scatole a sorpresa dai migliori fornai e contadini a fine giornata. Cibo fresco, metà prezzo.",
      ),
      image: surplusImg,
      variant: "photo",
      accent: "terracotta",
    },
    {
      href: "/ai",
      eyebrow: t("home.section.ai_eyebrow", "Botanico AI"),
      title: t("home.section.ai_title", "Cucina con quello che hai"),
      body: t(
        "home.section.ai_body",
        "Nessuna idea per cena? Chiedi al nostro assistente. Ti suggerirà ricette dagli ingredienti che già hai.",
      ),
      variant: "ai",
      accent: "leaf",
    },
    {
      href: "/recipes",
      eyebrow: t("home.section.recipes_eyebrow", "Il Ricettario"),
      title: t("home.section.recipes_title", "Piatti stagionali"),
      body: t(
        "home.section.recipes_body",
        "Centinaia di preparazioni vegetali che seguono il ritmo naturale delle stagioni.",
      ),
      image: recipesImg,
      variant: "photo",
      accent: "sun",
    },
    {
      href: "/restaurants",
      eyebrow: t("home.section.restaurants_eyebrow", "Tavole Locali"),
      title: t("home.section.restaurants_title", "Osterie e bistrot"),
      body: t(
        "home.section.restaurants_body",
        "Trova i luoghi vicino a te dove la cucina vegetale è trattata con rispetto e creatività.",
      ),
      image: restaurantsImg,
      variant: "photo",
      accent: "leaf",
    },
    {
      href: "/community",
      eyebrow: t("home.section.community_eyebrow", "La Radice"),
      title: t("home.section.community_title", "Unisciti alla tavolata"),
      body: t(
        "home.section.community_body",
        "Scambia ricette, condividi successi in cucina e incontra appassionati nella tua zona.",
      ),
      image: communityImg,
      variant: "feature",
      accent: "leaf",
    },
  ];

  return (
    <section className="px-4 sm:px-6 py-20 lg:py-28 bg-background border-t border-border/40">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal text-foreground tracking-tight max-w-2xl text-balance animate-fade-up">
            {t("home.sections_title", "Passeggia tra i banchi.")}
          </h2>
          <p
            className="text-muted-foreground max-w-[36ch] text-base sm:text-lg animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {t(
              "home.sections_subtitle",
              "Sei aree pensate per trasformare il tuo modo di vivere e consumare il cibo vegetale.",
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {sections.map((s, i) => (
            <SectionCard key={s.href} section={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionCard({ section, index }: { section: Section; index: number }) {
  const { t } = useTranslation();
  const delay = `${0.05 + index * 0.07}s`;

  const accentText =
    section.accent === "terracotta"
      ? "text-secondary"
      : section.accent === "sun"
        ? "text-tertiary-foreground"
        : "text-primary";

  // Variant: AI conversation card
  if (section.variant === "ai") {
    return (
      <Link
        to={section.href}
        className="group bg-vireo-cream/60 hover:bg-vireo-cream rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elegant hover:-translate-y-0.5 flex flex-col p-6 animate-fade-up"
        style={{ animationDelay: delay }}
      >
        <span className={`text-xs font-bold uppercase tracking-[0.2em] mb-3 ${accentText}`}>
          {section.eyebrow}
        </span>
        <h3 className="font-display text-2xl font-medium text-foreground mb-2 leading-tight">
          {section.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">{section.body}</p>
        <div className="space-y-2.5 mt-auto bg-background/80 p-4 rounded-xl border border-border/60">
          <div className="bg-muted text-foreground/80 p-2.5 rounded-xl rounded-tl-none text-xs sm:text-sm border border-border/40 max-w-[85%]">
            {t("home.ai_prompt", "Ho ceci e cavolfiore, idee?")}
          </div>
          <div className="bg-primary text-primary-foreground p-2.5 rounded-xl rounded-tr-none text-xs sm:text-sm max-w-[90%] ml-auto shadow-sm">
            {t("home.ai_reply", "Curry rustico in 25 minuti. Ti spiego i passaggi…")}
          </div>
        </div>
        <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {t("home.cta_open", "Apri l'assistente")}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    );
  }

  // Variant: feature card (community) — full image with overlay
  if (section.variant === "feature") {
    return (
      <Link
        to={section.href}
        className="group relative rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:shadow-elegant hover:-translate-y-0.5 flex flex-col text-vireo-cream min-h-[320px] sm:min-h-[360px] md:col-span-2 lg:col-span-1 animate-fade-up"
        style={{ animationDelay: delay }}
      >
        {section.image && (
          <img
            src={section.image}
            alt={section.title}
            loading="lazy"
            width={1024}
            height={704}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-vireo-leaf-deep/95 via-vireo-leaf-deep/60 to-vireo-leaf-deep/20" />
        <div className="relative z-10 p-6 flex-1 flex flex-col justify-end">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-vireo-cream/90 mb-3">
            {section.eyebrow}
          </span>
          <h3 className="font-display text-3xl font-normal mb-3 leading-tight">{section.title}</h3>
          <p className="text-sm text-vireo-cream/85 max-w-[34ch] mb-5">{section.body}</p>
          <div className="inline-flex items-center gap-1.5 text-sm font-medium">
            {t("home.cta_join", "Unisciti")}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Link>
    );
  }

  // Variant: standard photo card
  return (
    <Link
      to={section.href}
      className="group bg-card hover:bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elegant hover:-translate-y-0.5 flex flex-col animate-fade-up"
      style={{ animationDelay: delay }}
    >
      <div className="aspect-[3/2] bg-muted relative overflow-hidden">
        {section.image && (
          <img
            src={section.image}
            alt={section.title}
            loading="lazy"
            width={1024}
            height={704}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <span className={`text-[11px] font-bold uppercase tracking-[0.22em] mb-2.5 ${accentText}`}>
          {section.eyebrow}
        </span>
        <h3 className="font-display text-xl sm:text-2xl font-medium text-foreground mb-2 leading-tight">
          {section.title}
        </h3>
        <p className="text-sm text-muted-foreground flex-1">{section.body}</p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {t("home.cta_discover", "Scopri")}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
