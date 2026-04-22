import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Mail,
  Phone,
  Users,
  Utensils,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import {
  useOwnedRestaurants,
  useRestaurantReservations,
  useUpdateReservationStatus,
  type RestaurantReservation,
} from "@/hooks/useRestaurantOwner";

const STATUS_VARIANT: Record<
  RestaurantReservation["status"],
  { label: string; className: string }
> = {
  pending: { label: "In attesa", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  confirmed: { label: "Confermata", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  cancelled: { label: "Annullata", className: "bg-destructive/15 text-destructive border-destructive/30" },
  completed: { label: "Completata", className: "bg-muted text-muted-foreground border-border" },
};

function StatusBadge({ status }: { status: RestaurantReservation["status"] }) {
  const v = STATUS_VARIANT[status];
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>;
}

function formatDate(date: string) {
  try {
    return format(parseISO(date), "EEE d MMM yyyy", { locale: it });
  } catch {
    return date;
  }
}

function formatTime(time: string) {
  return time?.slice(0, 5) ?? time;
}

export default function RestaurantOwnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: restaurants = [], isLoading: loadingRestaurants } = useOwnedRestaurants();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [tab, setTab] = useState<"upcoming" | "all" | RestaurantReservation["status"]>("upcoming");

  useEffect(() => {
    if (!selectedId && restaurants.length > 0) {
      setSelectedId(restaurants[0].id);
    }
  }, [restaurants, selectedId]);

  const { data: reservations = [], isLoading: loadingReservations } =
    useRestaurantReservations(selectedId);
  const updateStatus = useUpdateReservationStatus();

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (tab === "upcoming") {
      return reservations.filter(
        (r) => r.reservation_date >= today && r.status !== "cancelled",
      );
    }
    if (tab === "all") return reservations;
    return reservations.filter((r) => r.status === tab);
  }, [reservations, tab]);

  const counts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      pending: reservations.filter((r) => r.status === "pending").length,
      upcoming: reservations.filter(
        (r) => r.reservation_date >= today && r.status !== "cancelled",
      ).length,
      total: reservations.length,
    };
  }, [reservations]);

  useEffect(() => {
    document.title = "Dashboard ristoratore — Vireo";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Gestisci le prenotazioni del tuo ristorante: conferma, annulla e organizza la tua sala.",
      );
    }
  }, []);

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Utensils className="size-4" /> Area ristoratore
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Dashboard ristoratore
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Visualizza e gestisci le prenotazioni del tuo locale. Conferma, annulla o
            segna come completate.
          </p>
        </header>

        {loadingRestaurants ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : restaurants.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nessun ristorante associato</CardTitle>
              <CardDescription>
                Il tuo account non è ancora collegato a nessun ristorante. Contatta un
                amministratore per richiedere l'abbinamento del tuo locale, oppure torna
                alla home.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/">Torna alla home</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Restaurant selector */}
            {restaurants.length > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <label className="text-sm font-medium mb-2 block">
                    Ristorante
                  </label>
                  <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger className="max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} — {r.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>In attesa di conferma</CardDescription>
                  <CardTitle className="text-3xl">{counts.pending}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Prossime prenotazioni</CardDescription>
                  <CardTitle className="text-3xl">{counts.upcoming}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Totale storico</CardDescription>
                  <CardTitle className="text-3xl">{counts.total}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Reservations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-5" /> Prenotazioni
                </CardTitle>
                <CardDescription>
                  {restaurants.find((r) => r.id === selectedId)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                  <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="upcoming">Prossime</TabsTrigger>
                    <TabsTrigger value="pending">In attesa</TabsTrigger>
                    <TabsTrigger value="confirmed">Confermate</TabsTrigger>
                    <TabsTrigger value="completed">Completate</TabsTrigger>
                    <TabsTrigger value="cancelled">Annullate</TabsTrigger>
                    <TabsTrigger value="all">Tutte</TabsTrigger>
                  </TabsList>

                  <TabsContent value={tab} className="mt-4">
                    {loadingReservations ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-sm">
                        Nessuna prenotazione in questa vista.
                      </div>
                    ) : (
                      <>
                        {/* Mobile cards */}
                        <div className="grid gap-3 md:hidden">
                          {filtered.map((r) => (
                            <ReservationCard
                              key={r.id}
                              reservation={r}
                              onUpdate={(status) =>
                                updateStatus.mutate({
                                  id: r.id,
                                  status,
                                  restaurant_id: r.restaurant_id,
                                })
                              }
                              loading={updateStatus.isPending}
                            />
                          ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Data &amp; ora</TableHead>
                                <TableHead>Ospite</TableHead>
                                <TableHead>Persone</TableHead>
                                <TableHead>Contatti</TableHead>
                                <TableHead>Stato</TableHead>
                                <TableHead className="text-right">Azioni</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filtered.map((r) => (
                                <TableRow key={r.id}>
                                  <TableCell>
                                    <div className="font-medium">{formatDate(r.reservation_date)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatTime(r.reservation_time)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{r.guest_name}</div>
                                    {r.notes && (
                                      <div className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                                        {r.notes}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <span className="inline-flex items-center gap-1">
                                      <Users className="size-3.5 text-muted-foreground" />
                                      {r.party_size}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <a
                                      href={`mailto:${r.guest_email}`}
                                      className="flex items-center gap-1 text-xs hover:underline"
                                    >
                                      <Mail className="size-3" /> {r.guest_email}
                                    </a>
                                    {r.guest_phone && (
                                      <a
                                        href={`tel:${r.guest_phone}`}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                                      >
                                        <Phone className="size-3" /> {r.guest_phone}
                                      </a>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <StatusBadge status={r.status} />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <ReservationActions
                                      status={r.status}
                                      loading={updateStatus.isPending}
                                      onUpdate={(status) =>
                                        updateStatus.mutate({
                                          id: r.id,
                                          status,
                                          restaurant_id: r.restaurant_id,
                                        })
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function ReservationCard({
  reservation: r,
  onUpdate,
  loading,
}: {
  reservation: RestaurantReservation;
  onUpdate: (status: RestaurantReservation["status"]) => void;
  loading: boolean;
}) {
  return (
    <div className="border border-border/60 rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{r.guest_name}</div>
          <div className="text-xs text-muted-foreground">
            {formatDate(r.reservation_date)} · {formatTime(r.reservation_time)}
          </div>
        </div>
        <StatusBadge status={r.status} />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="size-3" /> {r.party_size} pers.
        </span>
        <a href={`mailto:${r.guest_email}`} className="inline-flex items-center gap-1 hover:underline">
          <Mail className="size-3" /> {r.guest_email}
        </a>
        {r.guest_phone && (
          <a href={`tel:${r.guest_phone}`} className="inline-flex items-center gap-1 hover:underline">
            <Phone className="size-3" /> {r.guest_phone}
          </a>
        )}
      </div>
      {r.notes && (
        <p className="text-xs text-muted-foreground border-l-2 border-border pl-2">{r.notes}</p>
      )}
      <ReservationActions status={r.status} loading={loading} onUpdate={onUpdate} />
    </div>
  );
}

function ReservationActions({
  status,
  loading,
  onUpdate,
}: {
  status: RestaurantReservation["status"];
  loading: boolean;
  onUpdate: (status: RestaurantReservation["status"]) => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status === "pending" && (
        <Button
          size="sm"
          onClick={() => onUpdate("confirmed")}
          disabled={loading}
          className="gap-1"
        >
          <Check className="size-3.5" /> Conferma
        </Button>
      )}
      {status === "confirmed" && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onUpdate("completed")}
          disabled={loading}
          className="gap-1"
        >
          <Check className="size-3.5" /> Completa
        </Button>
      )}
      {status !== "cancelled" && status !== "completed" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdate("cancelled")}
          disabled={loading}
          className="gap-1"
        >
          <X className="size-3.5" /> Annulla
        </Button>
      )}
    </div>
  );
}
