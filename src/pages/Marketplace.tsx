import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Recycle, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  eco_score: string;
}

const PLACEHOLDER_PRODUCTS: Product[] = [
  { id: 1, name: "Borraccia in Bambù", description: "Borraccia termica 500ml realizzata in bambù naturale e acciaio inox.", price: 24.90, category: "Casa", eco_score: "A+" },
  { id: 2, name: "Spazzolino Compostabile", description: "Set di 4 spazzolini in bambù con setole vegetali biodegradabili.", price: 12.50, category: "Igiene", eco_score: "A+" },
  { id: 3, name: "Beeswax Wrap Set", description: "Set 3 fogli riutilizzabili in cera d'api per conservare alimenti.", price: 18.00, category: "Cucina", eco_score: "A" },
  { id: 4, name: "Sapone Solido Bio", description: "Sapone artigianale a freddo con oli essenziali biologici.", price: 8.90, category: "Igiene", eco_score: "A+" },
  { id: 5, name: "Sacchetti Riutilizzabili", description: "Set 6 sacchetti in cotone organico per la spesa sfusa.", price: 14.00, category: "Spesa", eco_score: "A" },
  { id: 6, name: "Compostiera da Balcone", description: "Compostiera compatta per appartamenti con filtro anti-odore.", price: 45.00, category: "Casa", eco_score: "A+" },
];

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/marketplace")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setProducts(data))
      .catch(() => setProducts(PLACEHOLDER_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-0">
              <Recycle className="size-3 mr-1" /> Eco-Marketplace
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Marketplace
            </h1>
            <p className="text-lg text-muted-foreground">
              Prodotti sostenibili selezionati per uno stile di vita green. Ogni acquisto fa la differenza.
            </p>
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Cerca prodotti..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <Card key={p.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/30 rounded-t-lg flex items-center justify-center">
                    <ShoppingBag className="size-10 text-primary/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-display">{p.name}</CardTitle>
                      <Badge className="bg-primary/15 text-primary border-0 text-xs">{p.eco_score}</Badge>
                    </div>
                    <CardDescription>{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground flex items-center gap-1">
                      <Tag className="size-4 text-muted-foreground" /> €{p.price.toFixed(2)}
                    </span>
                    <Button size="sm">Aggiungi</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nessun prodotto trovato.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
