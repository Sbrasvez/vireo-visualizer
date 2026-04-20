import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useHasRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldOff, Search, UserPlus, UserMinus, Loader2, MapPin } from "lucide-react";

type AdminRestaurant = {
  id: string;
  name: string;
  slug: string;
  city: string;
  region: string | null;
  owner_user_id: string | null;
};

export default function AdminRestaurants() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { has: isAdmin, isLoading: roleLoading } = useHasRole("admin");
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [assignTarget, setAssignTarget] = useState<AdminRestaurant | null>(null);
  const [emailQuery, setEmailQuery] = useState("");
  const [foundUser, setFoundUser] = useState<{ user_id: string; email: string } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/admin/restaurants");
  }, [user, loading, navigate]);

  useEffect(() => {
    document.title = "Admin Ristoranti — Vireo";
  }, []);

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["admin-restaurants"],
    enabled: isAdmin,
    queryFn: async (): Promise<AdminRestaurant[]> => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, slug, city, region, owner_user_id")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const ownerEmails = useQuery({
    queryKey: ["admin-restaurant-owners", restaurants.map((r) => r.owner_user_id).filter(Boolean).join(",")],
    enabled: isAdmin && restaurants.some((r) => r.owner_user_id),
    queryFn: async () => {
      const ids = Array.from(new Set(restaurants.map((r) => r.owner_user_id).filter(Boolean) as string[]));
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", ids);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((p) => { map[p.user_id] = p.display_name ?? ""; });
      return map;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        (r.region ?? "").toLowerCase().includes(q),
    );
  }, [restaurants, search]);

  const assignOwner = useMutation({
    mutationFn: async ({ restaurantId, ownerId }: { restaurantId: string; ownerId: string | null }) => {
      const { error } = await supabase
        .from("restaurants")
        .update({ owner_user_id: ownerId })
        .eq("id", restaurantId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast.success("Proprietario aggiornato");
      setAssignTarget(null);
      setEmailQuery("");
      setFoundUser(null);
      setLookupError(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });

  const handleLookup = async () => {
    setLookupError(null);
    setFoundUser(null);
    const email = emailQuery.trim();
    if (!email) return;
    setIsLookingUp(true);
    try {
      const { data, error } = await supabase.rpc("admin_find_user_by_email", { _email: email });
      if (error) throw error;
      const row = (data as any[])?.[0];
      if (!row) {
        setLookupError("Nessun utente trovato con questa email");
      } else {
        setFoundUser({ user_id: row.user_id, email: row.email });
      }
    } catch (e: any) {
      setLookupError(e?.message ?? "Errore nella ricerca");
    } finally {
      setIsLookingUp(false);
    }
  };

  const openAssign = (r: AdminRestaurant) => {
    setAssignTarget(r);
    setEmailQuery("");
    setFoundUser(null);
    setLookupError(null);
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 container max-w-5xl">
          <div className="h-64 rounded-2xl border border-border/60 bg-card animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 container max-w-2xl">
          <Card>
            <CardHeader>
              <ShieldOff className="size-10 text-destructive mb-2" />
              <CardTitle>Accesso negato</CardTitle>
              <CardDescription>Solo gli amministratori possono accedere a questa pagina.</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="container max-w-5xl">
          <h1 className="font-display text-4xl font-bold mb-2">Admin Ristoranti</h1>
          <p className="text-muted-foreground mb-6">
            Assegna o rimuovi il proprietario di un ristorante. I proprietari potranno gestire le proprie prenotazioni dalla dashboard ristoratore.
          </p>

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome, città, regione…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="h-64 rounded-2xl border border-border/60 bg-card animate-pulse" />
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">Nessun ristorante trovato</CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => {
                const ownerName = r.owner_user_id ? ownerEmails.data?.[r.owner_user_id] : undefined;
                return (
                  <Card key={r.id}>
                    <CardContent className="p-5 flex flex-wrap items-start gap-4">
                      <div className="flex-1 min-w-[240px]">
                        <h3 className="font-display text-lg font-bold">{r.name}</h3>
                        <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                          <MapPin className="size-3" /> {r.city}{r.region ? `, ${r.region}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">/restaurants/{r.slug}</p>
                        <div className="mt-2">
                          {r.owner_user_id ? (
                            <Badge variant="secondary">
                              Proprietario: {ownerName || r.owner_user_id.slice(0, 8) + "…"}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Nessun proprietario</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openAssign(r)}>
                          <UserPlus className="size-4 mr-1" />
                          {r.owner_user_id ? "Cambia" : "Assegna"}
                        </Button>
                        {r.owner_user_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignOwner.mutate({ restaurantId: r.id, ownerId: null })}
                            disabled={assignOwner.isPending}
                          >
                            <UserMinus className="size-4 mr-1" />
                            Rimuovi
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assegna proprietario</DialogTitle>
            <DialogDescription>
              {assignTarget?.name} — Cerca l'utente per email. Deve aver già creato un account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label htmlFor="email">Email utente</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="utente@esempio.com"
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleLookup(); } }}
              />
              <Button onClick={handleLookup} disabled={isLookingUp || !emailQuery.trim()}>
                {isLookingUp ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              </Button>
            </div>

            {lookupError && <p className="text-sm text-destructive">{lookupError}</p>}

            {foundUser && (
              <Card className="bg-muted/40">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{foundUser.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{foundUser.user_id}</p>
                  </div>
                  <Badge variant="secondary">Trovato</Badge>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>Annulla</Button>
            <Button
              disabled={!foundUser || assignOwner.isPending}
              onClick={() =>
                assignTarget && foundUser &&
                assignOwner.mutate({ restaurantId: assignTarget.id, ownerId: foundUser.user_id })
              }
            >
              {assignOwner.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Conferma assegnazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
