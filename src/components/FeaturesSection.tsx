import { Utensils, MapPin, ShoppingBag, Bot, Mic, BookOpen } from "lucide-react";
import featureRestaurant from "@/assets/feature-restaurant.jpg";
import featureMarket from "@/assets/feature-market.jpg";
import featureAI from "@/assets/feature-ai.jpg";

const features = [
  {
    icon: Utensils,
    title: "Ricette Vegane & Bio",
    description: "Migliaia di ricette filtrabili per dieta, ingredienti, tempo di preparazione e valori nutrizionali, con suggerimenti per ingredienti locali.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    title: "Mappa Interattiva",
    description: "Geolocalizzazione avanzata per trovare ristoranti e negozi eco-friendly con filtri per prezzo, rating e distanza.",
    color: "bg-tertiary/15 text-tertiary",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace Etico",
    description: "Vetrina dedicata alla compravendita di prodotti eco e al riuso, con linee guida rigorose per garantire la sostenibilità.",
    color: "bg-secondary/15 text-secondary",
  },
  {
    icon: Bot,
    title: "Assistente AI",
    description: "Chatbot basato su GPT che ti guida con suggerimenti personalizzati, piani alimentari e consigli per ridurre lo spreco.",
    color: "bg-vireo-leaf/10 text-vireo-leaf",
  },
  {
    icon: Mic,
    title: "Comandi Vocali",
    description: "Riconoscimento vocale per interazioni hands-free — chiedi ricette, timer e conversioni mentre cucini.",
    color: "bg-vireo-clay/20 text-vireo-terracotta",
  },
  {
    icon: BookOpen,
    title: "Blog & Community",
    description: "Articoli, guide e una rete di persone impegnate in scelte responsabili. Notifiche, social e prenotazioni live.",
    color: "bg-primary/10 text-primary",
  },
];

const showcase = [
  { src: featureRestaurant, alt: "Ristorante eco-friendly con piante e luce naturale", label: "Ristoranti", value: "500+" },
  { src: featureMarket, alt: "Mercato bio con verdure fresche e prodotti sostenibili", label: "Marketplace", value: "1.2k" },
  { src: featureAI, alt: "Smartphone con app di ricette green in cucina", label: "AI", value: "24/7" },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">L'ecosistema Vireo</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5 text-balance">
            Tutto ciò che serve per <span className="italic text-gradient-leaf">vivere green</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Una piattaforma digitale d'avanguardia che integra tecnologia, sostenibilità e benessere.
          </p>
        </div>

        {/* Showcase strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20">
          {showcase.map((item, i) => (
            <div
              key={item.label}
              className="group relative aspect-[4/5] sm:aspect-[3/4] rounded-3xl overflow-hidden hover-lift animate-fade-up"
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
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-7 hover-lift animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`inline-flex items-center justify-center size-12 rounded-xl ${f.color} mb-5 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <f.icon className="size-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
