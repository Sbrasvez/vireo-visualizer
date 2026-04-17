import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface GreenLevel {
  key: "seedling" | "sprout" | "leaf" | "branch" | "tree" | "forest";
  min: number;
  max: number; // exclusive
  emoji: string;
}

export const GREEN_LEVELS: GreenLevel[] = [
  { key: "seedling", min: 0, max: 100, emoji: "🌱" },
  { key: "sprout", min: 100, max: 250, emoji: "🌿" },
  { key: "leaf", min: 250, max: 500, emoji: "🍀" },
  { key: "branch", min: 500, max: 750, emoji: "🌾" },
  { key: "tree", min: 750, max: 1000, emoji: "🌳" },
  { key: "forest", min: 1000, max: Infinity, emoji: "🌲" },
];

export interface Badge {
  key: string;
  emoji: string;
  unlockedAt?: string | null;
}

export interface GreenScoreData {
  score: number;
  level: GreenLevel;
  nextLevel: GreenLevel | null;
  progressPct: number; // 0-100 to next level
  badges: Badge[];
  loading: boolean;
  breakdown: {
    savedRecipes: number;
    reservations: number;
    orders: number;
    reviews: number;
  };
}

export function useGreenScore(): GreenScoreData {
  const { user } = useAuth();
  const [data, setData] = useState<GreenScoreData>({
    score: 0,
    level: GREEN_LEVELS[0],
    nextLevel: GREEN_LEVELS[1],
    progressPct: 0,
    badges: [],
    loading: true,
    breakdown: { savedRecipes: 0, reservations: 0, orders: 0, reviews: 0 },
  });

  useEffect(() => {
    if (!user) {
      setData((d) => ({ ...d, loading: false }));
      return;
    }
    let cancel = false;
    (async () => {
      const [saved, reservations, reviews, orders] = await Promise.all([
        supabase.from("saved_recipes").select("id, created_at").eq("user_id", user.id),
        supabase.from("restaurant_reservations").select("id, created_at").eq("user_id", user.id),
        supabase.from("restaurant_reviews").select("id, created_at").eq("user_id", user.id),
        supabase.from("orders").select("id, created_at").eq("user_id", user.id).eq("status", "paid"),
      ]);
      if (cancel) return;

      const savedCount = saved.data?.length ?? 0;
      const reservationsCount = reservations.data?.length ?? 0;
      const reviewsCount = reviews.data?.length ?? 0;
      const ordersCount = orders.data?.length ?? 0;

      // Scoring rules (also documented in tooltip):
      // saved recipe = 15, reservation eco = 10, review = 20, order marketplace = 25
      const score =
        savedCount * 15 + reservationsCount * 10 + reviewsCount * 20 + ordersCount * 25;

      const level = GREEN_LEVELS.find((l) => score >= l.min && score < l.max) ?? GREEN_LEVELS[0];
      const nextIdx = GREEN_LEVELS.indexOf(level) + 1;
      const nextLevel = nextIdx < GREEN_LEVELS.length ? GREEN_LEVELS[nextIdx] : null;
      const progressPct = nextLevel
        ? Math.min(100, Math.round(((score - level.min) / (nextLevel.min - level.min)) * 100))
        : 100;

      const badges: Badge[] = [
        { key: "first_recipe", emoji: "🥗", unlockedAt: saved.data?.[0]?.created_at ?? null },
        { key: "explorer", emoji: "🗺️", unlockedAt: reservationsCount >= 3 ? reservations.data?.[2].created_at : null },
        { key: "reviewer", emoji: "✍️", unlockedAt: reviewsCount >= 1 ? reviews.data?.[0].created_at : null },
        { key: "shopper", emoji: "🛍️", unlockedAt: ordersCount >= 1 ? orders.data?.[0].created_at : null },
        { key: "collector", emoji: "📚", unlockedAt: savedCount >= 10 ? saved.data?.[9].created_at : null },
      ];

      setData({
        score,
        level,
        nextLevel,
        progressPct,
        badges,
        loading: false,
        breakdown: {
          savedRecipes: savedCount,
          reservations: reservationsCount,
          orders: ordersCount,
          reviews: reviewsCount,
        },
      });
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  return data;
}
