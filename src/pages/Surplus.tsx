import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Leaf, Package, Ticket, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  useMagicBags,
  useMyBagReservations,
  useReserveMagicBag,
  type MagicBag,
} from "@/hooks/useMagicBags";

const categoryLabels: Record<string, string> = {
  bakery: "Panetteria",
  meal: "Pasto pronto",
  mixed: "Sorpresa mista",
  groceries: "Drogheria",
};

function formatTimeWindow(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(s)}–${fmt(e)}`;
}

function MagicBagCard({ bag, index }: { bag: MagicBag; index: number }) {
  const { user } = useAuth();
  const { mutate, isPending } = useReserveMagicBag();
  const discount = Math.round(
    (1 - bag.discounted_price / bag.original_price) * 100
  );

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.25)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {bag.image_url || bag.restaurant?.cover_image ? (
          <img
            src={bag.image_url ?? bag.restaurant?.cover_image ?? ""}
            alt={bag.title}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Package className="size-12 text-primary/60" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/90 bg-black/30 backdrop-blur px-2 py-1 rounded-full">
            N°{String(index + 1).padStart(2, "0")}
          </span>
          <Badge className="bg-destructive/90 text-destructive-foreground border-0 backdrop-blur">
            -{discount}%
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="gap-1 backdrop-blur bg-background/80">
            <Leaf className="size-3" /> {bag.co2_saved_kg}kg
          </Badge>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5">
            {categoryLabels[bag.category] ?? bag.category}
          </p>
          <h3 className="font-display text-lg leading-tight text-foreground">
            {bag.title}
          </h3>
          {bag.restaurant && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
              <MapPin className="size-3" />
              {bag.restaurant.name} · {bag.restaurant.city}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5" />
            {formatTimeWindow(bag.pickup_start, bag.pickup_end)}
          </span>
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
            {bag.quantity_available} disp.
          </span>
        </div>
        <div className="flex items-end justify-between pt-3 mt-auto border-t border-border/60">
          <div>
            <span className="font-mono text-[10px] text-muted-foreground line-through">
              €{bag.original_price.toFixed(2)}
            </span>
            <p className="font-display text-2xl font-light text-primary leading-none mt-0.5">
              €{bag.discounted_price.toFixed(2)}
            </p>
          </div>
          {user ? (
            <Button
              size="sm"
              onClick={() => mutate({ bagId: bag.id })}
              disabled={isPending}
              className="rounded-full"
            >
              {isPending ? "..." : "Riserva"}
            </Button>
          ) : (
            <Button size="sm" asChild className="rounded-full">
              <Link to="/login">Accedi</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Surplus() {
  const { data: bags, isLoading } = useMagicBags();
  const { data: myReservations } = useMyBagReservations();
  const { user } = useAuth();
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    if (!bags) return [];
    if (category === "all") return bags;
    return bags.filter((b) => b.category === category);
  }, [bags, category]);

  const totalCo2Saved = useMemo(() => {
    return (bags ?? []).reduce(
      (acc, b) => acc + Number(b.co2_saved_kg) * b.quantity_available,
      0
    );
  }, [bags]);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Editorial header */}
        <header className="space-y-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-primary/40" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary">
              Anti-spreco · Magic Bags
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl font-light leading-[1.05] text-foreground">
              Salva il <em className="italic font-normal text-primary">cibo buono</em>,
              <br className="hidden sm:block" />
              riduci lo spreco.
            </h1>
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              Pasti e prodotti dai ristoranti vicini fino al{" "}
              <span className="text-foreground font-medium">-70%</span>. Ogni Magic
              Bag evita circa 2,5 kg di CO₂.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs">
              <Package className="size-3.5 text-primary" />
              <span className="font-mono tabular-nums">{bags?.length ?? 0}</span>
              <span className="text-muted-foreground">disponibili oggi</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs">
              <Leaf className="size-3.5 text-primary" />
              <span className="font-mono tabular-nums">{totalCo2Saved.toFixed(1)}</span>
              <span className="text-muted-foreground">kg CO₂ salvabili</span>
            </span>
          </div>
        </header>

        {user && myReservations && myReservations.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Ticket className="size-4 text-primary" />
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary">
                  Prenotazioni attive
                </p>
              </div>
              <div className="space-y-2">
                {myReservations
                  .filter((r: any) => r.status === "reserved")
                  .slice(0, 3)
                  .map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 text-sm bg-background rounded-xl p-3 border border-border/40"
                    >
                      <div className="min-w-0">
                        <p className="font-display font-medium truncate">
                          {r.magic_bag?.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.magic_bag?.restaurant?.name} ·{" "}
                          {r.magic_bag &&
                            formatTimeWindow(
                              r.magic_bag.pickup_start,
                              r.magic_bag.pickup_end
                            )}
                        </p>
                      </div>
                      <Badge className="font-mono tracking-[0.15em] text-xs shrink-0">
                        {r.pickup_code}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section divider */}
        <div className="flex items-center gap-3 pt-2">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Selezione di oggi
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="bg-transparent gap-1 h-auto p-0 flex-wrap justify-start">
            {[
              { v: "all", l: "Tutto" },
              { v: "meal", l: "Pasti" },
              { v: "bakery", l: "Panetteria" },
              { v: "mixed", l: "Sorprese" },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs font-mono tracking-wider uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary"
              >
                {t.l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={category} className="mt-8">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-dashed border-border/60 rounded-2xl">
                <Sparkles className="size-10 mx-auto mb-3 opacity-30" />
                <p className="font-display text-lg">
                  Nessuna Magic Bag in questa categoria
                </p>
                <p className="text-sm mt-1">Torna più tardi o esplora altre categorie.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((b, i) => (
                  <MagicBagCard key={b.id} bag={b} index={i} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
