import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RestaurantMap, { type RestaurantMarker } from "@/components/RestaurantMap";
import { MapPin, Star, Clock, Leaf, Filter, Map as MapIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import r1 from "@/assets/restaurant-1.jpg";
import r2 from "@/assets/restaurant-2.jpg";
import r3 from "@/assets/restaurant-3.jpg";

const restaurants: RestaurantMarker[] = [
  { id: 1, name: "Verde Mediterraneo", img: r1, city: "Milano", rating: 4.9, price: "€€", available: true, lng: 9.1900, lat: 45.4642 },
  { id: 2, name: "Radici Urban Bistrot", img: r2, city: "Roma", rating: 4.8, price: "€€€", available: true, lng: 12.4964, lat: 41.9028 },
  { id: 3, name: "Orto al Tavolo", img: r3, city: "Firenze", rating: 4.7, price: "€€", available: false, lng: 11.2558, lat: 43.7696 },
  { id: 4, name: "La Foglia d'Oro", img: r1, city: "Torino", rating: 4.9, price: "€€€", available: true, lng: 7.6869, lat: 45.0703 },
  { id: 5, name: "Botanico Bistrot", img: r2, city: "Bologna", rating: 4.6, price: "€€", available: true, lng: 11.3426, lat: 44.4949 },
  { id: 6, name: "Giardino Segreto", img: r3, city: "Napoli", rating: 4.8, price: "€€", available: true, lng: 14.2681, lat: 40.8518 },
];

const restaurantsExtra: Record<number, { distance: string; tags: string[] }> = {
  1: { distance: "1.2 km", tags: ["100% Vegano", "Bio certificato"] },
  2: { distance: "2.8 km", tags: ["Plant-based", "Locale"] },
  3: { distance: "0.6 km", tags: ["Km 0", "Stagionale"] },
  4: { distance: "3.4 km", tags: ["Stellato green", "Innovativo"] },
  5: { distance: "1.8 km", tags: ["Vegano", "Cocktail bio"] },
  6: { distance: "2.1 km", tags: ["Outdoor", "Mediterraneo"] },
};

export default function Restaurants() {
  const [activeId, setActiveId] = useState<number | null>(null);

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
                Geolocalizzazione avanzata per individuare ristoranti, negozi bio e servizi sostenibili. Prenotazioni in tempo reale.
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

        <section className="py-16">
          <div className="container">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <div className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-2">
                  <MapIcon className="size-4" />
                  Esplora sulla mappa
                </div>
                <h2 className="font-display text-3xl font-bold">Locali geolocalizzati in Italia</h2>
                <p className="text-muted-foreground mt-1">Clicca su un pin per vedere dettagli e prenotare</p>
              </div>
            </div>
            <RestaurantMap
              restaurants={restaurants}
              activeId={activeId}
              onMarkerClick={(id) => setActiveId(id)}
            />
          </div>
        </section>

        <section className="pb-20">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold">Vicino a te</h2>
                <p className="text-muted-foreground mt-1">{restaurants.length} ristoranti disponibili</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((r, i) => {
                const extra = restaurantsExtra[r.id];
                const isActive = activeId === r.id;
                return (
                  <article
                    key={r.id}
                    onClick={() => setActiveId(r.id)}
                    className={`group rounded-2xl bg-card border overflow-hidden hover-lift animate-fade-up cursor-pointer transition-colors ${isActive ? "border-primary ring-2 ring-primary/30" : "border-border/60"}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
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
                        <span className="flex items-center gap-1"><MapPin className="size-3.5" />{r.city} · {extra.distance}</span>
                        <span>·</span>
                        <span>{r.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {extra.tags.map((t) => (
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
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
