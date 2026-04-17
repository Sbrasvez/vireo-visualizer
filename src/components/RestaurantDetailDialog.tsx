import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { format } from "date-fns";
import { it, enUS, es, fr, de } from "date-fns/locale";
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
import { ReviewForm } from "@/components/ReviewForm";

interface Props {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const buildSchema = (t: (k: string) => string) =>
  z.object({
    name: z.string().trim().min(2, t("restaurant_dialog.err_name")).max(80),
    email: z.string().trim().email(t("restaurant_dialog.err_email")).max(255),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    partySize: z.number().int().min(1).max(20),
    date: z.date(),
    time: z.string().regex(/^\d{2}:\d{2}$/, t("restaurant_dialog.err_time")),
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
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { menu, photos, reviews, loading, refresh } = useRestaurantDetails(
    restaurant?.id ?? null,
  );
  const dateLocale = ({ it, en: enUS, es, fr, de } as any)[i18n.language] || it;

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
    const reservationSchema = buildSchema(t);
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
        title: t("restaurant_dialog.check_data_error"),
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    if (!date) {
      toast({ title: t("restaurant_dialog.select_date_error"), variant: "destructive" });
      return;
    }
    if (!time) {
      toast({ title: t("restaurant_dialog.select_time_error"), variant: "destructive" });
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
        title: t("restaurant_dialog.reservation_error"),
        description: error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    supabase.functions
      .invoke("send-transactional-email", {
        body: {
          templateName: "reservation-confirmation",
          recipientEmail: parsed.data.email,
          idempotencyKey: `reservation-confirm-${reservationId}`,
          templateData: {
            name: parsed.data.name,
            restaurantName: restaurant.name,
            date: format(parsed.data.date, "EEEE d MMMM yyyy", { locale: dateLocale }),
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
      title: t("restaurant_dialog.reservation_sent"),
      description: t("restaurant_dialog.see_you_at", { restaurant: restaurant.name }),
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
                  {t("restaurant_dialog.available_now")}
                </Badge>
              ) : (
                <Badge variant="secondary">{t("restaurant_dialog.complete_tonight")}</Badge>
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
                  <span className="text-foreground/70">{t("restaurant_dialog.reviews_count", { count: restaurant.reviews_count ?? 0 })}</span>
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
            <TabsTrigger value="info">{t("restaurant_dialog.tab_info")}</TabsTrigger>
            <TabsTrigger value="menu">{t("restaurant_dialog.tab_menu")}</TabsTrigger>
            <TabsTrigger value="photos">{t("restaurant_dialog.tab_photos")}</TabsTrigger>
            <TabsTrigger value="reviews">{t("restaurant_dialog.tab_reviews")}</TabsTrigger>
            <TabsTrigger value="reserve" className="gap-1">
              <Heart className="size-3.5" />
              {t("restaurant_dialog.tab_reserve")}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5">
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
                <InfoRow icon={MapPin} label={t("restaurant_dialog.address")}>{restaurant.address}</InfoRow>
                {restaurant.phone && (
                  <InfoRow icon={Phone} label={t("restaurant_dialog.phone")}>
                    <a href={`tel:${restaurant.phone}`} className="hover:text-primary">{restaurant.phone}</a>
                  </InfoRow>
                )}
                {restaurant.email && (
                  <InfoRow icon={Mail} label={t("restaurant_dialog.email")}>
                    <a href={`mailto:${restaurant.email}`} className="hover:text-primary">{restaurant.email}</a>
                  </InfoRow>
                )}
                {restaurant.website && (
                  <InfoRow icon={Globe} label={t("restaurant_dialog.website")}>
                    <a href={restaurant.website} target="_blank" rel="noreferrer" className="hover:text-primary">{restaurant.website.replace(/^https?:\/\//, "")}</a>
                  </InfoRow>
                )}
              </div>
              {restaurant.opening_hours && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Clock className="size-4 text-primary" />
                    {t("restaurant_dialog.opening_hours")}
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
                              {t("restaurant_dialog.allergens")}: {(m.allergens || []).join(", ")}
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
              <ReviewForm restaurantId={restaurant.id} onSubmitted={refresh} />
              {reviews.length === 0 && (
                <p className="text-muted-foreground text-sm">{t("restaurant_dialog.no_reviews")}</p>
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
                      <Label htmlFor="r-name">{t("restaurant_dialog.name")}*</Label>
                      <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("restaurant_dialog.your_name")} maxLength={80} />
                    </div>
                    <div>
                      <Label htmlFor="r-email">{t("restaurant_dialog.email")}*</Label>
                      <Input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={user?.email ?? "tua@email.it"} maxLength={255} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="r-phone">{t("restaurant_dialog.phone")}</Label>
                      <Input id="r-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("restaurant_dialog.phone_placeholder")} maxLength={30} />
                    </div>
                    <div>
                      <Label htmlFor="r-party">{t("restaurant_dialog.covers")}*</Label>
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
                      <Label>{t("restaurant_dialog.date")}*</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal">
                            <CalendarIcon className="size-4 mr-2" />
                            {date ? format(date, "EEE d MMM yyyy", { locale: dateLocale }) : t("restaurant_dialog.choose_date")}
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
                      <Label>{t("restaurant_dialog.time")}*</Label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTime(slot)}
                            className={`text-xs py-2 rounded-md border transition-colors ${
                              time === slot
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-accent border-border"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="r-notes">{t("restaurant_dialog.notes")} ({t("restaurant_dialog.notes_placeholder")})</Label>
                    <Textarea id="r-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} />
                  </div>
                  <Button
                    onClick={handleReserve}
                    disabled={submitting}
                    size="lg"
                    className="w-full shadow-elegant"
                  >
                    {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Heart className="size-4 mr-2" />}
                    {submitting ? t("restaurant_dialog.submitting") : t("restaurant_dialog.reserve_btn")}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {t("restaurant_dialog.email_confirmation_note")}
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
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
