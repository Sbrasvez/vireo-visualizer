import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Giulia M.",
    role: "Food blogger vegana",
    text: "Vireo ha rivoluzionato la mia routine. Le ricette sono curate, l'AI mi suggerisce alternative quando ho ingredienti diversi e la mappa dei ristoranti è impeccabile.",
    rating: 5,
  },
  {
    name: "Marco R.",
    role: "Chef del Ristorante Verde",
    text: "Da quando siamo su Vireo, abbiamo aumentato le prenotazioni del 40%. La community è davvero attenta alla sostenibilità e ai prodotti locali.",
    rating: 5,
  },
  {
    name: "Sara T.",
    role: "Mamma & utente green",
    text: "I comandi vocali mentre cucino sono una manna. E il marketplace del riuso mi ha permesso di abbattere gli sprechi della famiglia.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">Voci della community</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5 text-balance">
            Una community che cresce <span className="italic text-gradient-leaf">ogni giorno</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="rounded-3xl border border-border/60 bg-card p-8 hover-lift animate-fade-up relative"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Quote className="absolute top-6 right-6 size-8 text-primary/15" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="size-4 fill-tertiary text-tertiary" />
                ))}
              </div>
              <blockquote className="text-foreground/90 leading-relaxed mb-6">
                "{t.text}"
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="size-11 rounded-full gradient-leaf flex items-center justify-center text-primary-foreground font-display font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
