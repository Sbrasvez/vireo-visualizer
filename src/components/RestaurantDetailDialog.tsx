import { useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Mail,
  Leaf,
  Calendar as CalendarIcon,
  Users,
  Loader2,
  Check,
  Heart,
} from "lucide-react";
import {
  Restaurant,
  useRestaurantDetails,
} from "@/hooks/useRestaurants";
import { useToast } from "@/hooks/use-toast";

interface Props {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const reservationSchema = z.object({
  name: z.string().trim().min(2, "Inserisci il tuo nome").max(80),
  email: z.string().trim().email("Email non valida").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  partySize: z.number().int().min(1).max(20),
  date: z.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Orario non valido"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

const TIME_SLOTS = [
  "12:30", "13:00", "13:30", "14:00",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

export default function RestaurantDetailDialog({
  restaurant,
  open,
  onOpenChange,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { menu, photos, reviews, loading } = useRestaurantDetails(
    restaurant?.id ?? null,
  );

  // Reservation form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  if (!restaurant) return null;

  const cover = restaurant.cover_image || photos[0]?.url;
  const menuByCategory = menu.reduce<Record<string, typeof menu>>((acc, m) => {
    (acc[m.category] = acc[m.category] || []).push(m);
    return acc;
  }, {});

  const handleReserve = async () => {
    const parsed = reservationSchema.safeParse({
      name: user?.email ? name || user.email.split("@")[0] : name,
      email: email || user?.email || "",
      phone,
      partySize,
      date: date ?? new Date(),
      time,
      notes,
    });
    if (!parsed.success) {
      toast({
        title: "Controlla i dati",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    if (!date) {
      toast({ title: "Seleziona una data", variant: "destructive" });
      return;
    }
    if (!time) {
      toast({ title: "Seleziona un orario", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const reservationId = crypto.randomUUID();
    const { error } = await supabase.from("restaurant_reservations").insert({
      id: reservationId,
      restaurant_id: restaurant.id,
      user_id: user?.id ?? null,
      guest_name: parsed.data.name,
      guest_email: parsed.data.email,
      guest_phone: parsed.data.phone || null,
      reservation_date: format(parsed.data.date, "yyyy-MM-dd"),
      reservation_time: parsed.data.time + ":00",
      party_size: parsed.data.partySize,
      notes: parsed.data.notes || null,
    });

    if (error) {
      toast({
        title: "Errore prenotazione",
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Fire-and-forget email confirmation (works only if email infra is set up)
    supabase.functions
      .invoke("send-transactional-email", {
        body: {
          templateName: "reservation-confirmation",
          recipientEmail: parsed.data.email,
          idempotencyKey: `reservation-confirm-${reservationId}`,
          templateData: {
            name: parsed.data.name,
            restaurantName: restaurant.name,
            date: format(parsed.data.date, "EEEE d MMMM yyyy", { locale: it }),
            time: parsed.data.time,
            partySize: parsed.data.partySize,
            address: restaurant.address,
            city: restaurant.city,
          },
        },
      })
      .catch(() => {});

    setSuccess(true);
    setSubmitting(false);
    toast({
      title: "Prenotazione inviata!",
      description: `Ti aspettiamo da ${restaurant.name}`,
    });
  };

  const resetAndClose = () => {
    setSuccess(false);
    setName("");
    setEmail("");
    setPhone("");
    setPartySize(2);
    setDate(undefined);
    setTime("");
    setNotes("");
    setActiveTab("info");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : resetAndClose())}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0 max-h-[92vh] flex flex-col">
        {/* Hero */}
        <div className="relative h-56 sm:h-72 shrink-0 overflow-hidden">
          {cover && (
            <img
              src={cover}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              width={1200}
              height={600}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {restaurant.available_now ? (
                <Badge className="bg-primary text-primary-foreground gap-1.5">
                  <span className="size-2 rounded-full bg-primary-foreground animate-pulse" />
                  Disponibile ora
                </Badge>
              ) : (
                <Badge variant="secondary">Completo stasera</Badge>
              )}
              {(restaurant.eco_certifications || []).slice(0, 2).map((c) => (
                <Badge key={c} variant="outline" className="bg-background/80 backdrop-blur-sm gap-1">
                  <Leaf className="size-3" />
                  {c}
                </Badge>
              ))}
            </div>
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="font-display text-3xl sm:text-4xl text-foreground drop-shadow-sm">
                {restaurant.name}
              </DialogTitle>
              <div className="flex items-center gap-3 text-sm text-foreground/90">
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-tertiary text-tertiary" />
                  <strong>{restaurant.rating?.toFixed(1) ?? "—"}</strong>
                  <span className="text-foreground/70">({restaurant.reviews_count} recensioni)</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" /> {restaurant.city}
                </span>
                <span>·</span>
                <span className="font-semibold">{restaurant.price}</span>
              </div>
            </DialogHeader>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-6 mt-4 grid w-auto grid-cols-5 bg-muted">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="photos">Foto</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="reserve" className="gap-1">
              <Heart className="size-3.5" />
              Prenota
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-5">
            <TabsContent value="info" className="mt-0 space-y-5">
              {restaurant.description && (
                <p className="text-base leading-relaxed text-foreground/90">
                  {restaurant.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine.map((c) => (
                  <Badge key={c} className="bg-accent text-accent-foreground capitalize">
                    {c.replace("_", " ")}
                  </Badge>
                ))}
                {(restaurant.tags || []).map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <InfoRow icon={MapPin} label="Indirizzo">{restaurant.address}</InfoRow>
                {restaurant.phone && (
                  <InfoRow icon={Phone} label="Telefono">
                    <a href={`tel:${restaurant.phone}`} className="hover:text-primary">{restaurant.phone}</a>
                  </InfoRow>
                )}
                {restaurant.email && (
                  <InfoRow icon={Mail} label="Email">
                    <a href={`mailto:${restaurant.email}`} className="hover:text-primary">{restaurant.email}</a>
                  </InfoRow>
                )}
                {restaurant.website && (
                  <InfoRow icon={Globe} label="Sito web">
                    <a href={restaurant.website} target="_blank" rel="noreferrer" className="hover:text-primary">{restaurant.website.replace(/^https?:\/\//, "")}</a>
                  </InfoRow>
                )}
              </div>
              {restaurant.opening_hours && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Clock className="size-4 text-primary" />
                    Orari di apertura
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground">
                    {Object.entries(restaurant.opening_hours).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-border/50 py-1.5">
                        <span className="capitalize">{k.replace("-", " - ")}</span>
                        <span>{v as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="menu" className="mt-0 space-y-6">
              {loading && <Loader2 className="size-5 animate-spin text-primary" />}
              {!loading && Object.entries(menuByCategory).map(([cat, items]) => (
                <div key={cat}>
                  <h3 className="font-display text-xl font-semibold mb-3">{cat}</h3>
                  <div className="space-y-3">
                    {items.map((m) => (
                      <div key={m.id} className="flex justify-between gap-4 pb-3 border-b border-border/50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{m.name}</h4>
                            {m.is_vegan && (
                              <Leaf className="size-3.5 text-primary shrink-0" />
                            )}
                          </div>
                          {m.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>
                          )}
                          {(m.allergens || []).length > 0 && (
                            <p className="text-xs text-muted-foreground/80 mt-1">
                              Allergeni: {(m.allergens || []).join(", ")}
                            </p>
                          )}
                        </div>
                        {m.price && (
                          <span className="font-display text-base font-semibold text-primary shrink-0">
                            € {m.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="photos" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p) => (
                  <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg group">
                    <img
                      src={p.url}
                      alt={p.caption || restaurant.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      width={400}
                      height={400}
                    />
                    {p.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <span className="text-xs text-white">{p.caption}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0 space-y-4">
              {reviews.length === 0 && (
                <p className="text-muted-foreground text-sm">Nessuna recensione ancora.</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-border/60 p-4 bg-card">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold">{r.author_name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < r.rating ? "fill-tertiary text-tertiary" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.title && <h4 className="font-medium text-sm mb-1">{r.title}</h4>}
                  {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="reserve" className="mt-0">
              {success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto size-16 rounded-full bg-primary/15 grid place-items-center">
                    <Check className="size-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold">Prenotazione confermata!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Abbiamo inviato i dettagli della prenotazione a <strong>{email || user?.email}</strong>.
                    Ti aspettiamo da {restaurant.name}.
                  </p>
                  <Button onClick={resetAndClose} size="lg">Chiudi</Button>
                </div>
              ) : (
                <div className="space-y-4 max-w-2xl">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="r-name">Nome*</Label>
                      <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Il tuo nome" maxLength={80} />
                    </div>
                    <div>
                      <Label htmlFor="r-email">Email*</Label>
                      <Input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={user?.email ?? "tua@email.it"} maxLength={255} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="r-phone">Telefono</Label>
                      <Input id="r-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+39 ..." maxLength={30} />
                    </div>
                    <div>
                      <Label htmlFor="r-party">Coperti*</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="r-party"
                          type="number"
                          min={1}
                          max={20}
                          value={partySize}
                          onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Data*</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal">
                            <CalendarIcon className="size-4 mr-2" />
                            {date ? format(date, "EEE d MMM yyyy", { locale: it }) : "Scegli una data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-popover" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Orario*</Label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {TIME_SLOTS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTime(t)}
                            className={`text-xs py-2 rounded-md border transition-colors ${
                              time === t
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-accent border-border"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="r-notes">Note (allergie, occasioni speciali...)</Label>
                    <Textarea id="r-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} />
                  </div>
                  <Button
                    onClick={handleReserve}
                    disabled={submitting}
                    size="lg"
                    className="w-full shadow-elegant"
                  >
                    {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Heart className="size-4 mr-2" />}
                    Conferma prenotazione
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Riceverai una email di conferma con tutti i dettagli.
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="size-9 rounded-lg bg-accent grid place-items-center shrink-0">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{children}</div>
      </div>
    </div>
  );
}
