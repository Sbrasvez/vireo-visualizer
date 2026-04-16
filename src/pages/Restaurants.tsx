import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Star, Clock, Leaf, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import r1 from "@/assets/restaurant-1.jpg";
import r2 from "@/assets/restaurant-2.jpg";
import r3 from "@/assets/restaurant-3.jpg";

const restaurants = [
  { id: 1, name: "Verde Mediterraneo", img: r1, city: "Milano", distance: "1.2 km", rating: 4.9, reviews: 234, price: "€€", tags: ["100% Vegano", "Bio certificato"], available: true },
  { id: 2, name: "Radici Urban Bistrot", img: r2, city: "Roma", distance: "2.8 km", rating: 4.8, reviews: 187, price: "€€€", tags: ["Plant-based", "Locale"], available: true },
  { id: 3, name: "Orto al Tavolo", img: r3, city: "Firenze", distance: "0.6 km", rating: 4.7, reviews: 312, price: "€€", tags: ["Km 0", "Stagionale"], available: false },
  { id: 4, name: "La Foglia d'Oro", img: r1, city: "Torino", distance: "3.4 km", rating: 4.9, reviews: 156, price: "€€€", tags: ["Stellato green", "Innovativo"], available: true },
  { id: 5, name: "Botanico Bistrot", img: r2, city: "Bologna", distance: "1.8 km", rating: 4.6, reviews: 98, price: "€€", tags: ["Vegano", "Cocktail bio"], available: true },
  { id: 6, name: "Giardino Segreto", img: r3, city: "Napoli", distance: "2.1 km", rating: 4.8, reviews: 421, price: "€€", tags: ["Outdoor", "Mediterraneo"], available: true },
];

export default function Restaurants() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-16 gradient-soft overflow-hidden">
          <div className="absolute top-20 left-10 size-80 rounded-full bg-secondary/15 blur-3xl animate-float-slow" />
          <div className="container relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-up">
                <MapPin className="size-4" />
                <span>Mappa interattiva + Prenotazioni live</span>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold mb-5 text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
                Ristoranti <span className="italic text-gradient-warm">eco-friendly</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
                Geolocalizzazione avanzata per individuare ristoranti, negozi bio e servizi sostenibili. Prenotazioni in tempo reale via Socket.IO.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input placeholder="La tua città o quartiere..." className="pl-12 h-14 rounded-xl text-base border-border bg-card" />
                </div>
                <Button size="lg" variant="outline" className="h-14 px-6 rounded-xl gap-2"><Filter className="size-4" /> Filtri</Button>
                <Button size="lg" className="h-14 px-8 rounded-xl shadow-elegant">Cerca</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold">Vicino a te</h2>
                <p className="text-muted-foreground mt-1">{restaurants.length} ristoranti disponibili</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((r, i) => (
                <article key={r.id} className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover-lift animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={r.img} alt={r.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" width={1024} height={768} />
                    <div className="absolute top-3 left-3">
                      {r.available ? (
                        <Badge className="bg-primary text-primary-foreground gap-1.5">
                          <span className="size-2 rounded-full bg-primary-foreground animate-pulse" />
                          Disponibile ora
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Completo stasera</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">{r.name}</h3>
                      <div className="flex items-center gap-1 shrink-0 text-sm font-semibold">
                        <Star className="size-4 fill-tertiary text-tertiary" />
                        {r.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MapPin className="size-3.5" />{r.city} · {r.distance}</span>
                      <span>·</span>
                      <span>{r.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {r.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                          <Leaf className="size-3 inline mr-1" />
                          {t}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full rounded-lg" disabled={!r.available} size="sm">
                      <Clock className="size-4 mr-2" />
                      {r.available ? "Prenota live" : "Lista d'attesa"}
                    </Button>
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
