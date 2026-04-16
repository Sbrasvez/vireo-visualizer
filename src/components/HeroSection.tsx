import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-[10%] size-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-[10%] size-96 rounded-full bg-secondary/15 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 animate-fade-up">
            <Sparkles className="size-4" />
            <span>AI-Powered Sustainable Living</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Vivi <span className="text-primary">smart</span>,{" "}
            <br className="hidden sm:block" />
            scegli <span className="text-secondary">green</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Ricette sostenibili, ristoranti eco-friendly, un marketplace etico
            e un assistente AI — tutto in un'unica piattaforma per un futuro più verde.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="gap-2 text-base px-8 rounded-xl shadow-lg shadow-primary/25" asChild>
              <Link to="/signup">
                Inizia ora
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 text-base px-8 rounded-xl" asChild>
              <Link to="/recipes">Esplora le ricette</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-20 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "0.45s" }}>
            {[
              { value: "2k+", label: "Ricette" },
              { value: "500+", label: "Ristoranti" },
              { value: "10k+", label: "Utenti" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}