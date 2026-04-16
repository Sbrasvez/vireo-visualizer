import { Utensils, MapPin, ShoppingBag, Bot, Mic, BookOpen } from "lucide-react";

const features = [
  {
    icon: Utensils,
    title: "Ricette Sostenibili",
    description: "Scopri migliaia di ricette a basso impatto ambientale con ingredienti di stagione e punteggio di sostenibilità.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    title: "Ristoranti Eco",
    description: "Trova ristoranti green vicino a te, con menu sostenibili, prodotti locali e certificazioni ambientali.",
    color: "bg-vireo-sky/10 text-vireo-sky",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace Etico",
    description: "Acquista prodotti sostenibili da fornitori certificati. Dal campo alla tavola, senza intermediari.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Bot,
    title: "Assistente AI",
    description: "Il tuo chef virtuale: suggerimenti personalizzati, piani alimentari e consigli per ridurre lo spreco.",
    color: "bg-vireo-earth/10 text-vireo-earth",
  },
  {
    icon: Mic,
    title: "Comandi Vocali",
    description: "Cucina a mani libere — chiedi ricette, timer e conversioni con la voce mentre prepari i piatti.",
    color: "bg-destructive/10 text-destructive",
  },
  {
    icon: BookOpen,
    title: "Blog & Guide",
    description: "Articoli, guide e linee guida per adottare uno stile di vita più sostenibile, un passo alla volta.",
    color: "bg-primary/10 text-primary",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/40">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Funzionalità</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Tutto ciò che serve per vivere green
          </h2>
          <p className="text-muted-foreground text-lg">
            Una piattaforma completa che rende semplice e piacevole fare scelte sostenibili ogni giorno.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-7 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center size-12 rounded-xl ${f.color} mb-5`}>
                <f.icon className="size-6" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}