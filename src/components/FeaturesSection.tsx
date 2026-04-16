import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Utensils, MapPin, ShoppingBag, Bot, Mic, BookOpen } from "lucide-react";
import featureRestaurant from "@/assets/feature-restaurant.jpg";
import featureMarket from "@/assets/feature-market.jpg";
import featureAI from "@/assets/feature-ai.jpg";

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    { icon: Utensils, title: t("features.items.recipes_title"), description: t("features.items.recipes_desc"), color: "bg-primary/10 text-primary", to: "/recipes" },
    { icon: MapPin, title: t("features.items.map_title"), description: t("features.items.map_desc"), color: "bg-tertiary/15 text-tertiary", to: "/restaurants" },
    { icon: ShoppingBag, title: t("features.items.market_title"), description: t("features.items.market_desc"), color: "bg-secondary/15 text-secondary", to: "/marketplace" },
    { icon: Bot, title: t("features.items.ai_title"), description: t("features.items.ai_desc"), color: "bg-vireo-leaf/10 text-vireo-leaf", to: "/ai" },
    { icon: Mic, title: t("features.items.voice_title"), description: t("features.items.voice_desc"), color: "bg-vireo-clay/20 text-vireo-terracotta", to: "/ai" },
    { icon: BookOpen, title: t("features.items.blog_title"), description: t("features.items.blog_desc"), color: "bg-primary/10 text-primary", to: "/blog" },
  ];

  const showcase = [
    { src: featureRestaurant, alt: t("features.items.map_title"), label: t("nav.restaurants"), value: "500+", to: "/restaurants" },
    { src: featureMarket, alt: t("features.items.market_title"), label: t("nav.marketplace"), value: "1.2k", to: "/marketplace" },
    { src: featureAI, alt: t("features.items.ai_title"), label: "AI", value: "24/7", to: "/ai" },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">{t("features.kicker")}</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5 text-balance">
            {t("features.title_1")} <span className="italic text-gradient-leaf">{t("features.title_green")}</span>
          </h2>
          <p className="text-muted-foreground text-lg">{t("features.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20">
          {showcase.map((item, i) => (
            <Link
              key={item.label}
              to={item.to}
              className="group relative aspect-[4/5] sm:aspect-[3/4] rounded-3xl overflow-hidden hover-lift animate-fade-up block"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                width={1280}
                height={1024}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-background">
                <div className="font-display text-3xl font-bold">{item.value}</div>
                <div className="text-sm uppercase tracking-widest opacity-90">{item.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link
              key={f.title}
              to={f.to}
              className="group rounded-2xl border border-border/60 bg-card p-7 hover-lift animate-fade-up block"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`inline-flex items-center justify-center size-12 rounded-xl ${f.color} mb-5 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <f.icon className="size-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
