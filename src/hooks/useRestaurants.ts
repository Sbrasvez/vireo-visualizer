import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CuisineType =
  | "vegano"
  | "vegetariano"
  | "plant_based"
  | "bio"
  | "mediterraneo"
  | "crudista"
  | "fusion"
  | "km_zero";

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string | null;
  address: string;
  lat: number;
  lng: number;
  short_description: string | null;
  description: string | null;
  cuisine: CuisineType[];
  price: "€" | "€€" | "€€€" | "€€€€";
  phone: string | null;
  email: string | null;
  website: string | null;
  opening_hours: Record<string, string> | null;
  cover_image: string | null;
  rating: number | null;
  reviews_count: number | null;
  available_now: boolean;
  eco_certifications: string[] | null;
  tags: string[] | null;
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number | null;
  is_vegan: boolean | null;
  allergens: string[] | null;
}

export interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

export function useRestaurants() {
  const [data, setData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("name");
      if (cancel) return;
      if (error) setError(error.message);
      else setData((data || []) as Restaurant[]);
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return { restaurants: data, loading, error };
}

export function useRestaurantDetails(restaurantId: string | null) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    let cancel = false;
    setLoading(true);
    (async () => {
      const [m, p, r] = await Promise.all([
        supabase
          .from("restaurant_menu_items")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("sort_order"),
        supabase
          .from("restaurant_photos")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("sort_order"),
        supabase
          .from("restaurant_reviews")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("created_at", { ascending: false }),
      ]);
      if (cancel) return;
      setMenu((m.data || []) as MenuItem[]);
      setPhotos((p.data || []) as Photo[]);
      setReviews((r.data || []) as Review[]);
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [restaurantId]);

  return { menu, photos, reviews, loading };
}

// Haversine distance in km
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface Filters {
  cuisine: CuisineType | "all";
  price: "all" | "€" | "€€" | "€€€" | "€€€€";
  availableOnly: boolean;
  search: string;
  origin: { lat: number; lng: number } | null;
  radiusKm: number;
}

export function useFilteredRestaurants(
  restaurants: Restaurant[],
  filters: Filters,
) {
  return useMemo(() => {
    let list = restaurants.map((r) => ({
      ...r,
      _distance: filters.origin ? distanceKm(filters.origin, r) : null,
    }));

    if (filters.cuisine !== "all") {
      list = list.filter((r) => r.cuisine.includes(filters.cuisine as CuisineType));
    }
    if (filters.price !== "all") {
      list = list.filter((r) => r.price === filters.price);
    }
    if (filters.availableOnly) {
      list = list.filter((r) => r.available_now);
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          (r.tags || []).some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (filters.origin) {
      list = list.filter((r) => (r._distance ?? Infinity) <= filters.radiusKm);
      list.sort((a, b) => (a._distance ?? 0) - (b._distance ?? 0));
    }
    return list;
  }, [restaurants, filters]);
}

export type EnrichedRestaurant = Restaurant & { _distance: number | null };
