import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, Leaf, ChefHat } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Recipe {
  id: number;
  title: string;
  ingredients: string;
  instructions: string;
  preparation_time: string;
}

const PLACEHOLDER_RECIPES: Recipe[] = [
  { id: 1, title: "Buddha Bowl Primavera", ingredients: '["quinoa","avocado","ceci","spinaci","tahini"]', instructions: "Cuoci la quinoa, assembla con verdure fresche e condisci con salsa tahini.", preparation_time: "25 min" },
  { id: 2, title: "Pasta al Pesto di Cavolo Nero", ingredients: '["pasta integrale","cavolo nero","pinoli","parmigiano","aglio"]', instructions: "Frulla il cavolo nero con pinoli, parmigiano e aglio. Condisci la pasta.", preparation_time: "20 min" },
  { id: 3, title: "Curry di Lenticchie Rosse", ingredients: '["lenticchie rosse","latte di cocco","curry","pomodori","zenzero"]', instructions: "Cuoci le lenticchie con spezie e latte di cocco fino a cremosità.", preparation_time: "30 min" },
  { id: 4, title: "Insalata Rainbow", ingredients: '["carote","barbabietola","edamame","cavolo rosso","semi di girasole"]', instructions: "Taglia tutte le verdure julienne e condisci con vinaigrette al limone.", preparation_time: "15 min" },
  { id: 5, title: "Smoothie Bowl Tropicale", ingredients: '["mango","banana","latte di mandorla","granola","cocco"]', instructions: "Frulla mango e banana, versa nella bowl e decora con toppings.", preparation_time: "10 min" },
  { id: 6, title: "Risotto agli Asparagi", ingredients: '["riso carnaroli","asparagi","scalogno","vino bianco","brodo vegetale"]', instructions: "Tosta il riso, sfuma con vino e cuoci aggiungendo brodo e asparagi.", preparation_time: "35 min" },
];

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Try fetching from API, fallback to placeholder
    fetch("/api/recipes")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setRecipes(data))
      .catch(() => setRecipes(PLACEHOLDER_RECIPES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const parseIngredients = (ing: string): string[] => {
    try { return JSON.parse(ing); } catch { return [ing]; }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-0">
              <Leaf className="size-3 mr-1" /> Ricette Sostenibili
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Ricette
            </h1>
            <p className="text-lg text-muted-foreground">
              Scopri piatti sani e sostenibili, suggeriti dall'AI in base ai tuoi gusti e alla stagionalità.
            </p>
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cerca ricette..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((recipe) => (
                <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/30 rounded-t-lg flex items-center justify-center">
                    <ChefHat className="size-12 text-primary/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display">{recipe.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="size-3" /> {recipe.preparation_time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {parseIngredients(recipe.ingredients).slice(0, 4).map((ing, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                      Scopri di più →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nessuna ricetta trovata.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
