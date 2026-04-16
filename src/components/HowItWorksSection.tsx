import { Search, ChefHat, Leaf } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Scopri",
    description: "Esplora ricette vegane e bio, ristoranti eco e prodotti sostenibili con filtri avanzati e geolocalizzazione.",
  },
  {
    icon: ChefHat,
    number: "02",
    title: "Cucina & Ordina",
    description: "Segui ricette guidate dall'AI con comandi vocali, prenota tavoli live nei migliori locali green vicino a te.",
  },
  {
    icon: Leaf,
    number: "03",
    title: "Riduci l'impatto",
    description: "Monitora la CO₂ risparmiata, partecipa al marketplace del riuso e costruisci un futuro più verde.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/40 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">Come funziona</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5 text-balance">
            Tre passi verso uno <span className="italic text-gradient-warm">stile di vita green</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Democratizziamo uno stile di vita sano e sostenibile, sfruttando la tecnologia per ridurre l'impatto ambientale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
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
