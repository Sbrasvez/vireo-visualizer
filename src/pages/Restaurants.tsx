import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Utensils } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Restaurant {
  id: number;
  name: string;
  location: string;
  cuisine: string;
  rating: number;
  sustainable_practices: string;
}

const PLACEHOLDER_RESTAURANTS: Restaurant[] = [
  { id: 1, name: "Green Garden", location: "Milano, Navigli", cuisine: "Vegano", rating: 4.8, sustainable_practices: "Zero waste, km0, packaging compostabile" },
  { id: 2, name: "Terra & Sapori", location: "Roma, Trastevere", cuisine: "Bio Italiana", rating: 4.6, sustainable_practices: "Orto proprio, energia solare, menu stagionale" },
  { id: 3, name: "Radice", location: "Firenze, Centro", cuisine: "Plant-based", rating: 4.7, sustainable_practices: "Forniture locali, compostaggio, no plastica" },
  { id: 4, name: "Foglia Verde", location: "Torino, San Salvario", cuisine: "Raw & Vegan", rating: 4.5, sustainable_practices: "Ingredienti biologici, riduzione sprechi" },
  { id: 5, name: "Il Germoglio", location: "Bologna, Centro", cuisine: "Vegetariano", rating: 4.9, sustainable_practices: "Farm to table, packaging riutilizzabile" },
  { id: 6, name: "Mare Pulito", location: "Napoli, Lungomare", cuisine: "Pesce Sostenibile", rating: 4.4, sustainable_practices: "Pesca sostenibile certificata MSC" },
];

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setRestaurants(data))
      .catch(() => setRestaurants(PLACEHOLDER_RESTAURANTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-0">
              <MapPin className="size-3 mr-1" /> Eco-Friendly
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Ristoranti
            </h1>
            <p className="text-lg text-muted-foreground">
              Trova ristoranti sostenibili vicino a te, con recensioni e pratiche green verificate.
            </p>
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Cerca per nome o città..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r) => (
                <Card key={r.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                  <div className="h-36 bg-gradient-to-br from-accent/30 to-primary/10 rounded-t-lg flex items-center justify-center">
                    <Utensils className="size-10 text-primary/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-display">{r.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-amber-600">
                        <Star className="size-3.5 fill-amber-500 text-amber-500" /> {r.rating}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="size-3" /> {r.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="mb-2 text-xs">{r.cuisine}</Badge>
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.sustainable_practices}</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-primary hover:text-primary">
                      Prenota →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nessun ristorante trovato.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
