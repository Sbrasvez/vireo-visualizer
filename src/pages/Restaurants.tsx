import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RestaurantMap, { type RestaurantMarker } from "@/components/RestaurantMap";
import RestaurantDetailDialog from "@/components/RestaurantDetailDialog";
import { MapPin, Star, Clock, Leaf, Search, Map as MapIcon, Loader2, X, Sparkles } from "lucide-react";
import MotionCard from "@/components/MotionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useRestaurants,
  useFilteredRestaurants,
  type Filters,
  type Restaurant,
} from "@/hooks/useRestaurants";
import { useGeocoding } from "@/hooks/useGeocoding";
import { useToast } from "@/hooks/use-toast";
import heroImg from "@/assets/restaurants-hero.jpg";

export default function Restaurants() {
  const { t } = useTranslation();
  const { restaurants, loading } = useRestaurants();
  const { geocode, loading: geocoding } = useGeocoding();
  const { toast } = useToast();
  const CUISINE_KEYS = ["vegano", "vegetariano", "plant_based", "bio", "mediterraneo", "crudista", "fusion", "km_zero"] as const;
  const cuisineLabel = (k: string) => t(`restaurants.cuisines.${k}`, { defaultValue: k });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogRestaurant, setDialogRestaurant] = useState<Restaurant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [originLabel, setOriginLabel] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    cuisine: "all",
    price: "all",
    availableOnly: false,
    search: "",
    origin: null,
    radiusKm: 25,
  });

  const filtered = useFilteredRestaurants(restaurants, filters);

  // Handle ?focus=:slug deep link from AI chat (and elsewhere)
  const [searchParams, setSearchParams] = useSearchParams();
  const focusedSlugRef = useRef<string | null>(null);
  useEffect(() => {
    const slug = searchParams.get("focus");
    if (!slug || loading) return;
    if (focusedSlugRef.current === slug) return;
    const target = restaurants.find((r) => r.slug === slug);
    if (!target) return;
    focusedSlugRef.current = slug;
    // Center the map on the restaurant and surface it
    setFilters((f) => ({
      ...f,
      origin: { lat: target.lat, lng: target.lng },
      radiusKm: Math.max(f.radiusKm, 5),
      cuisine: "all",
      price: "all",
      availableOnly: false,
      search: "",
    }));
    setOriginLabel(`${target.name} · ${target.city}`);
    setActiveId(target.id);
    setDialogRestaurant(target);
    setDialogOpen(true);
    // Clean the URL so reopening dialog after closing isn't forced
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });
  }, [searchParams, restaurants, loading, setSearchParams]);

  const markers: RestaurantMarker[] = useMemo(
    () =>
      filtered.map((r) => ({
        id: r.id,
        name: r.name,
        city: r.city,
        rating: r.rating ?? 0,
        price: r.price,
        img: r.cover_image || "",
        available: r.available_now,
        lng: r.lng,
        lat: r.lat,
      })),
    [filtered],
  );

  const handleSearch = async () => {
    const q = searchInput.trim();
    if (!q) {
      toast({ title: t("restaurants.geo_no_location_title"), variant: "destructive" });
      return;
    }
    const result = await geocode(q);
    if (!result) {
      toast({
        title: t("restaurants.geo_not_found_title"),
        description: t("restaurants.geo_not_found_desc"),
        variant: "destructive",
      });
      return;
    }
    setFilters((f) => ({
      ...f,
      origin: { lat: result.lat, lng: result.lng },
      search: "",
    }));
    setOriginLabel(result.name);
    toast({
      title: t("restaurants.geo_set_title"),
      description: result.name,
    });
  };

  const clearOrigin = () => {
    setFilters((f) => ({ ...f, origin: null }));
    setOriginLabel(null);
    setSearchInput("");
  };

  const openDetail = (r: Restaurant) => {
    setDialogRestaurant(r);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        {/* HERO — editorial Tactile Market */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0">
            <img
              src={heroImg}
              alt=""
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/40" />
          </div>
          <div className="relative container py-20 lg:py-28">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6 animate-fade-up">
                <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">N°04</span>
                <span className="h-px flex-1 max-w-[60px] bg-border" />
                <div className="inline-flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider">
                  <Sparkles className="size-3.5" />
                  <span>{t("restaurants.badge_count", { count: restaurants.length })}</span>
                </div>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-[0.95] mb-6 text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
                {t("restaurants.title_1")}{" "}
                <em className="italic font-normal text-secondary">{t("restaurants.title_aware")}</em>
                {t("restaurants.title_2")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
                {t("restaurants.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    placeholder={t("restaurants.search_placeholder")}
                    className="pl-12 h-14 rounded-xl text-base bg-card/95 backdrop-blur-sm shadow-soft"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button size="lg" onClick={handleSearch} disabled={geocoding} className="h-14 px-8 rounded-xl shadow-elegant">
                  {geocoding ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4 mr-2" />}
                  {t("restaurants.search_btn")}
                </Button>
              </div>

              {originLabel && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-sm animate-fade-up">
                  <MapPin className="size-3.5 text-primary" />
                  <span className="text-foreground">{t("restaurants.centered_on")} <strong>{originLabel}</strong></span>
                  <button onClick={clearOrigin} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FILTERS + MAP */}
        <section className="py-12">
          <div className="container">
            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
              {/* FILTERS */}
              <aside className="bg-card rounded-2xl border border-border/60 p-5 h-fit lg:sticky lg:top-28 space-y-5 shadow-soft">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-sm font-semibold">{t("restaurants.filters_cuisine")}</Label>
                  </div>
                  <Select
                    value={filters.cuisine}
                    onValueChange={(v) => setFilters((f) => ({ ...f, cuisine: v as any }))}
                  >
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">{t("restaurants.all_cuisines")}</SelectItem>
                      {CUISINE_KEYS.map((k) => (
                        <SelectItem key={k} value={k}>{cuisineLabel(k)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-1 block">{t("restaurants.filters_price")}</Label>
                  <Select
                    value={filters.price}
                    onValueChange={(v) => setFilters((f) => ({ ...f, price: v as any }))}
                  >
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">{t("restaurants.any_price")}</SelectItem>
                      <SelectItem value="€">{t("restaurants.price_economy")}</SelectItem>
                      <SelectItem value="€€">{t("restaurants.price_medium")}</SelectItem>
                      <SelectItem value="€€€">{t("restaurants.price_high")}</SelectItem>
                      <SelectItem value="€€€€">{t("restaurants.price_premium")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.origin && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      {t("restaurants.radius_label")}: <span className="text-primary">{filters.radiusKm} km</span>
                    </Label>
                    <Slider
                      value={[filters.radiusKm]}
                      min={2}
                      max={100}
                      step={1}
                      onValueChange={(v) => setFilters((f) => ({ ...f, radiusKm: v[0] }))}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
                  <Label htmlFor="avail" className="text-sm font-semibold cursor-pointer">
                    {t("restaurants.available_only")}
                  </Label>
                  <Switch
                    id="avail"
                    checked={filters.availableOnly}
                    onCheckedChange={(v) => setFilters((f) => ({ ...f, availableOnly: v }))}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-1 block">{t("restaurants.search_by_name")}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={filters.search}
                      onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                      placeholder={t("restaurants.name_placeholder")}
                      className="pl-9 bg-background"
                    />
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-border/60">
                  <div className="text-3xl font-display font-bold text-primary">{filtered.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {filtered.length === 1 ? t("restaurants.found_one") : t("restaurants.found_many")}
                  </div>
                </div>
              </aside>

              {/* MAP */}
              <div>
                <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-1">
                      <MapIcon className="size-4" />
                      {t("restaurants.explore_map")}
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold">
                      {originLabel ? t("restaurants.near", { place: originLabel.split(",")[0] }) : t("restaurants.all_in_italy")}
                    </h2>
                  </div>
                </div>
                {loading ? (
                  <div className="h-[480px] rounded-2xl bg-muted grid place-items-center">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <RestaurantMap
                    restaurants={markers}
                    activeId={activeId}
                    onMarkerClick={(id) => {
                      setActiveId(id);
                      const r = filtered.find((x) => x.id === id);
                      if (r) openDetail(r);
                    }}
                    origin={filters.origin}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className="pb-24">
          <div className="container">
            <div className="flex items-end justify-between gap-6 mb-10 pb-6 border-b border-border/60 flex-wrap">
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
                  — {t("restaurants.list_eyebrow", "Indirizzi consigliati")}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
                  {originLabel ? t("restaurants.sorted_by_distance") : t("restaurants.all_restaurants")}
                </h2>
                <p className="text-muted-foreground mt-3 font-mono text-sm">
                  {t("restaurants.click_card_hint")}
                </p>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border/60">
                <Leaf className="size-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-display text-xl font-semibold mb-2">{t("restaurants.no_results_title")}</h3>
                <p className="text-muted-foreground text-sm">{t("restaurants.no_results_desc")}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((r, i) => {
                  const isActive = activeId === r.id;
                  return (
                    <MotionCard
                      key={r.id}
                      delay={Math.min(i, 12) * 0.04}
                      lift="medium"
                      onClick={() => {
                        setActiveId(r.id);
                        openDetail(r);
                      }}
                      onMouseEnter={() => setActiveId(r.id)}
                      className={`group rounded-2xl bg-card border overflow-hidden cursor-pointer ${
                        isActive ? "border-primary ring-2 ring-primary/30" : "border-border/60"
                      }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {r.cover_image && (
                          <img
                            src={r.cover_image}
                            alt={r.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            width={1024}
                            height={768}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                          {r.available_now ? (
                            <Badge className="bg-primary text-primary-foreground gap-1.5">
                              <span className="size-2 rounded-full bg-primary-foreground animate-pulse" />
                              {t("restaurants.available")}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{t("restaurants.complete")}</Badge>
                          )}
                          {r._distance != null && (
                            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                              {r._distance < 1 ? `${Math.round(r._distance * 1000)} m` : `${r._distance.toFixed(1)} km`}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                            {r.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 text-sm font-semibold">
                            <Star className="size-4 fill-tertiary text-tertiary" />
                            {r.rating?.toFixed(1) ?? "—"}
                          </div>
                        </div>
                        {r.short_description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {r.short_description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="size-3.5" />
                          <span>{r.city}</span>
                          <span>·</span>
                          <span className="font-semibold text-foreground">{r.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {r.cuisine.slice(0, 2).map((c) => (
                            <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">
                              <Leaf className="size-3 inline mr-1" />
                              {cuisineLabel(c)}
                            </span>
                          ))}
                        </div>
                        <Button
                          className="w-full rounded-lg"
                          disabled={!r.available_now}
                          size="sm"
                          variant={r.available_now ? "default" : "secondary"}
                        >
                          <Clock className="size-4 mr-2" />
                          {r.available_now ? t("restaurants.book_live") : t("restaurants.waitlist")}
                        </Button>
                      </div>
                    </MotionCard>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <RestaurantDetailDialog
        restaurant={dialogRestaurant}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
