import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Wallet, ShieldCheck, Sparkles, Leaf, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMySeller } from "@/hooks/useSeller";

export default function Sell() {
  const { user } = useAuth();
  const { data: mySeller } = useMySeller();

  const ctaTo = !user
    ? "/login?redirect=/sell/apply"
    : mySeller
      ? "/seller/dashboard"
      : "/sell/apply";
  const ctaLabel = !user
    ? "Accedi per candidarti"
    : mySeller
      ? mySeller.status === "approved"
        ? "Apri dashboard venditore"
        : mySeller.status === "pending"
          ? "Vedi stato candidatura"
          : "Riprova candidatura"
      : "Candidati ora";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-20 gradient-soft overflow-hidden">
          <div className="absolute top-10 right-10 size-96 rounded-full bg-primary/15 blur-3xl animate-float" />
          <div className="container relative">
            <div className="max-w-3xl">
              <Badge className="mb-6 px-4 py-1.5 bg-accent text-accent-foreground gap-2">
                <Store className="size-4" /> Marketplace Vireo
              </Badge>
              <h1 className="font-display text-5xl sm:text-6xl font-bold mb-5 text-balance">
                Vendi i tuoi prodotti <span className="italic text-gradient-leaf">eco</span> a una community che li ama.
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Apri il tuo store gratuitamente. Noi ti diamo visibilità, traffico e checkout sicuro. Tu pensi solo
                a creare. Trattieni l'85% di ogni vendita.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild className="h-14 px-8 rounded-xl shadow-elegant">
                  <Link to={ctaTo}>
                    {ctaLabel} <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-14 px-8 rounded-xl">
                  <Link to="/marketplace">Esplora il marketplace</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Wallet,
                  title: "Commissione 15%",
                  desc: "Paghi solo quando vendi. Nessun costo fisso, nessun abbonamento. Trattieni l'85%.",
                },
                {
                  icon: Sparkles,
                  title: "Visibilità immediata",
                  desc: "I tuoi prodotti compaiono nel marketplace, nelle ricerche AI e nei suggerimenti personalizzati.",
                },
                {
                  icon: ShieldCheck,
                  title: "Pagamenti sicuri",
                  desc: "Checkout e antifrode gestiti da Stripe. Tracciamento ordini integrato nella dashboard.",
                },
                {
                  icon: Leaf,
                  title: "Solo prodotti green",
                  desc: "Approviamo manualmente ogni venditore per garantire qualità e impatto positivo.",
                },
                {
                  icon: Store,
                  title: "Store personalizzato",
                  desc: "Pagina pubblica del tuo brand su /store/tuo-nome con bio, logo e tutti i prodotti.",
                },
                {
                  icon: ArrowRight,
                  title: "Onboarding in 5 minuti",
                  desc: "Compila il form, attendi l'approvazione (entro 48h) e inizia a vendere.",
                },
              ].map((f, i) => (
                <article
                  key={i}
                  className="rounded-2xl border border-border/60 bg-card p-6 hover-lift animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="size-12 rounded-xl bg-primary/10 grid place-items-center mb-4">
                    <f.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-accent/30">
          <div className="container text-center max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Pronto a portare il tuo brand su Vireo?
            </h2>
            <p className="text-muted-foreground mb-8">
              Compila la candidatura e iniziamo a costruire qualcosa di buono insieme.
            </p>
            <Button size="lg" asChild className="h-14 px-8 rounded-xl shadow-elegant">
              <Link to={ctaTo}>{ctaLabel}</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
