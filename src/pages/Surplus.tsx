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

function MagicBagCard({ bag }: { bag: MagicBag }) {
  const { user } = useAuth();
  const { mutate, isPending } = useReserveMagicBag();
  const discount = Math.round(
    (1 - bag.discounted_price / bag.original_price) * 100
  );

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-40 bg-muted">
        {bag.image_url || bag.restaurant?.cover_image ? (
          <img
            src={bag.image_url ?? bag.restaurant?.cover_image ?? ""}
            alt={bag.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Package className="size-12 text-primary/60" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
          -{discount}%
        </Badge>
        <Badge variant="secondary" className="absolute top-2 right-2 gap-1">
          <Leaf className="size-3" /> {bag.co2_saved_kg}kg CO₂
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <Badge variant="outline" className="mb-1.5 text-xs">
            {categoryLabels[bag.category] ?? bag.category}
          </Badge>
          <h3 className="font-semibold leading-tight">{bag.title}</h3>
          {bag.restaurant && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="size-3" />
              {bag.restaurant.name} · {bag.restaurant.city}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" />
            {formatTimeWindow(bag.pickup_start, bag.pickup_end)}
          </span>
          <span className="text-xs text-muted-foreground">
            {bag.quantity_available} disp.
          </span>
        </div>
        <div className="flex items-end justify-between pt-2 border-t">
          <div>
            <span className="text-xs text-muted-foreground line-through">
              €{bag.original_price.toFixed(2)}
            </span>
            <p className="text-xl font-bold text-primary">
              €{bag.discounted_price.toFixed(2)}
            </p>
          </div>
          {user ? (
            <Button
              size="sm"
              onClick={() => mutate({ bagId: bag.id })}
              disabled={isPending}
            >
              {isPending ? "..." : "Riserva"}
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">Accedi</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
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
      <div className="space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <h1 className="text-3xl font-display font-bold">Anti-spreco</h1>
          </div>
          <p className="text-muted-foreground">
            Salva pasti e cibo buono dai ristoranti vicini, fino al -70%. Ogni
            Magic Bag evita ~2.5 kg di CO₂.
          </p>
          <div className="flex flex-wrap gap-3 text-sm pt-2">
            <Badge variant="secondary" className="gap-1">
              <Package className="size-3" /> {bags?.length ?? 0} disponibili oggi
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Leaf className="size-3" /> {totalCo2Saved.toFixed(1)} kg CO₂ salvabili
            </Badge>
          </div>
        </header>

        {user && myReservations && myReservations.length > 0 && (
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Ticket className="size-4" /> Le tue prenotazioni attive
              </h2>
              <div className="space-y-2">
                {myReservations
                  .filter((r: any) => r.status === "reserved")
                  .slice(0, 3)
                  .map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between text-sm bg-background rounded-md p-2"
                    >
                      <div>
                        <p className="font-medium">{r.magic_bag?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.magic_bag?.restaurant?.name} ·{" "}
                          {r.magic_bag &&
                            formatTimeWindow(
                              r.magic_bag.pickup_start,
                              r.magic_bag.pickup_end
                            )}
                        </p>
                      </div>
                      <Badge className="font-mono tracking-wider">
                        {r.pickup_code}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList>
            <TabsTrigger value="all">Tutto</TabsTrigger>
            <TabsTrigger value="meal">Pasti</TabsTrigger>
            <TabsTrigger value="bakery">Panetteria</TabsTrigger>
            <TabsTrigger value="mixed">Sorprese</TabsTrigger>
          </TabsList>

          <TabsContent value={category} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="size-12 mx-auto mb-3 opacity-30" />
                <p>Nessuna Magic Bag disponibile in questa categoria.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((b) => (
                  <MagicBagCard key={b.id} bag={b} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
