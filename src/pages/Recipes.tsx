import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Clock, Flame, Leaf, ChefHat } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import recipe1 from "@/assets/recipe-1.jpg";
import recipe2 from "@/assets/recipe-2.jpg";
import recipe3 from "@/assets/recipe-3.jpg";
import recipe4 from "@/assets/recipe-4.jpg";

const recipes = [
  { id: 1, title: "Buddha Bowl ai Ceci e Tahini", img: recipe1, time: "25 min", kcal: 480, ecoScore: 9.4, tags: ["Vegana", "Bio", "Gluten-free"], category: "Pranzo" },
  { id: 2, title: "Avocado Toast con Ravanelli", img: recipe2, time: "10 min", kcal: 320, ecoScore: 9.1, tags: ["Vegana", "Veloce"], category: "Colazione" },
  { id: 3, title: "Smoothie Bowl ai Frutti di Bosco", img: recipe3, time: "8 min", kcal: 290, ecoScore: 9.6, tags: ["Vegana", "Raw"], category: "Colazione" },
  { id: 4, title: "Pasta al Pesto di Basilico", img: recipe4, time: "20 min", kcal: 540, ecoScore: 8.8, tags: ["Vegetariana", "Italiana"], category: "Pranzo" },
  { id: 5, title: "Curry di Lenticchie e Cocco", img: recipe1, time: "35 min", kcal: 510, ecoScore: 9.2, tags: ["Vegana", "Spicy"], category: "Cena" },
  { id: 6, title: "Insalata di Quinoa e Melagrana", img: recipe1, time: "15 min", kcal: 380, ecoScore: 9.5, tags: ["Vegana", "Bio"], category: "Pranzo" },
];

const categories = ["Tutte", "Colazione", "Pranzo", "Cena", "Dessert", "Snack"];

export default function Recipes() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-16 gradient-soft overflow-hidden">
          <div className="absolute top-10 right-10 size-72 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="container relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-up">
                <ChefHat className="size-4" />
                <span>Database Spoonacular + AI Vireo</span>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold mb-5 text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
                Ricette <span className="italic text-gradient-leaf">vegane</span> e bio
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
                Migliaia di ricette filtrabili per dieta, ingredienti, tempo di preparazione e valori nutrizionali. Suggerimenti per ingredienti locali e biologici.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input placeholder="Cerca una ricetta o un ingrediente..." className="pl-12 h-14 rounded-xl text-base border-border bg-card" />
                </div>
                <Button size="lg" className="h-14 px-8 rounded-xl shadow-elegant">Cerca</Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                {categories.map((c, i) => (
                  <Badge key={c} variant={i === 0 ? "default" : "outline"} className="px-4 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold">Ricette in evidenza</h2>
                <p className="text-muted-foreground mt-1">{recipes.length} ricette trovate</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((r, i) => (
                <article key={r.id} className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover-lift animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={r.img} alt={r.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" width={800} height={600} />
                    <div className="absolute top-3 right-3 bg-card/95 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-soft">
                      <Leaf className="size-3.5 text-primary" />
                      <span className="text-xs font-bold text-primary">{r.ecoScore}</span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="backdrop-blur">{r.category}</Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5"><Clock className="size-4" />{r.time}</span>
                      <span className="flex items-center gap-1.5"><Flame className="size-4" />{r.kcal} kcal</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
