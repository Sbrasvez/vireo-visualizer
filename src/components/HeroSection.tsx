import { ArrowRight, Sparkles, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBowl from "@/assets/hero-bowl.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-16 gradient-soft">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-[5%] size-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-[5%] size-96 rounded-full bg-secondary/15 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 right-1/4 size-64 rounded-full bg-tertiary/15 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 animate-fade-up">
              <Sparkles className="size-4" />
              <span>AI-Powered Sustainable Living</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 animate-fade-up text-balance" style={{ animationDelay: "0.1s" }}>
              Vivi <span className="italic text-gradient-warm">smart</span>,
              <br />
              scegli <span className="italic text-gradient-leaf">green</span>.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4 animate-fade-up font-medium" style={{ animationDelay: "0.2s" }}>
              "Vivi green, semplicemente."
            </p>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 animate-fade-up" style={{ animationDelay: "0.25s" }}>
              Ricette vegane e bio, ristoranti eco-friendly, marketplace etico
              e un assistente AI con comandi vocali — tutto in un'unica piattaforma per un futuro più verde.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" className="gap-2 text-base px-8 rounded-xl shadow-elegant group" asChild>
                <Link to="/signup">
                  Inizia ora
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 rounded-xl" asChild>
                <Link to="/recipes">Esplora le ricette</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.45s" }}>
              {[
                { value: "2k+", label: "Ricette bio" },
                { value: "500+", label: "Ristoranti" },
                { value: "10k+", label: "Utenti green" },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <div className="font-display text-3xl sm:text-4xl font-bold text-foreground">{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Hero image */}
          <div className="relative animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative aspect-square max-w-xl mx-auto">
              <div className="absolute -inset-4 gradient-leaf rounded-[2.5rem] opacity-20 blur-2xl" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-elegant ring-1 ring-border/50">
                <img
                  src={heroBowl}
                  alt="Bowl vegano sostenibile con quinoa, avocado, melagrana e verdure di stagione"
                  className="w-full h-full object-cover"
                  width={1600}
                  height={1600}
                />
              </div>

              {/* Floating badge: AI */}
              <div className="absolute -left-4 sm:-left-8 top-1/4 bg-card rounded-2xl p-4 shadow-elegant border border-border/50 animate-float-slow flex items-center gap-3 min-w-[180px]">
                <div className="size-10 rounded-xl gradient-leaf flex items-center justify-center shrink-0">
                  <Sparkles className="size-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Eco-score</div>
                  <div className="font-display text-lg font-bold text-primary">9.2/10</div>
                </div>
              </div>

              {/* Floating badge: leaf */}
              <div className="absolute -right-2 sm:-right-6 bottom-12 bg-card rounded-2xl p-4 shadow-warm border border-border/50 animate-float flex items-center gap-3" style={{ animationDelay: "1s" }}>
                <div className="size-10 rounded-xl gradient-warm flex items-center justify-center shrink-0">
                  <Leaf className="size-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">CO₂ risparmiata</div>
                  <div className="font-display text-lg font-bold text-secondary">−2.4 kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
