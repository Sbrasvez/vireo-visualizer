import { Link } from "react-router-dom";
import { MapPin, Star, Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";

export type RestaurantCardData = {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  image: string | null;
  cuisine: string[];
  price: string;
  rating: number | null;
  reviews_count: number | null;
  available_now: boolean;
  short_description: string | null;
  distance_km: number | null;
};

export function ChatRestaurantCards({ data }: { data: RestaurantCardData[] }) {
  const { t } = useTranslation();
  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic py-2">
        {t("ai.no_restaurants_found", "Nessun ristorante trovato.")}
      </div>
    );
  }

  return (
    <div className="not-prose space-y-2.5 my-2">
      {data.map((r) => (
        <Link
          key={r.id}
          to={`/restaurants?focus=${r.slug}`}
          className="block bg-background rounded-2xl border border-border overflow-hidden hover:border-primary/60 hover:shadow-md transition-all group"
        >
          {r.image && (
            <div className="relative w-full h-32 overflow-hidden bg-muted">
              <img
                src={r.image}
                alt={r.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 flex gap-1">
                {r.available_now && (
                  <span className="text-[10px] px-2 py-0.5 bg-primary/90 text-primary-foreground rounded-full font-semibold backdrop-blur">
                    {t("restaurants.available", "Disponibile")}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 bg-background/80 text-foreground rounded-full font-semibold backdrop-blur">
                  {r.price}
                </span>
              </div>
              {r.distance_km !== null && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-background/80 text-foreground rounded-full font-medium backdrop-blur">
                  <Navigation className="size-2.5" />
                  {r.distance_km} km
                </span>
              )}
            </div>
          )}
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="font-display font-semibold text-foreground text-sm leading-tight line-clamp-2">
                {r.name}
              </div>
              {r.rating ? (
                <span className="inline-flex items-center gap-0.5 text-xs text-foreground shrink-0">
                  <Star className="size-3 fill-tertiary text-tertiary" />
                  <span className="font-semibold">{r.rating}</span>
                  {r.reviews_count ? (
                    <span className="text-muted-foreground">({r.reviews_count})</span>
                  ) : null}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">
                {r.city} · {r.address}
              </span>
            </div>
            {r.short_description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                {r.short_description}
              </p>
            )}
            {r.cuisine?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {r.cuisine.slice(0, 3).map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium uppercase"
                  >
                    {c.replace("_", " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
