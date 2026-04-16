import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DashboardStats {
  savedRecipes: number;
  reservations: number;
  orders: number;
  co2KgSaved: number;
}

export function useDashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    savedRecipes: 0,
    reservations: 0,
    orders: 0,
    co2KgSaved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancel = false;
    (async () => {
      const [saved, reservations, co2] = await Promise.all([
        supabase
          .from("saved_recipes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("restaurant_reservations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase.from("co2_log").select("kg_co2").eq("user_id", user.id),
      ]);
      if (cancel) return;
      const co2Sum =
        co2.data?.reduce((acc, r: { kg_co2: number | string }) => acc + Number(r.kg_co2), 0) ?? 0;
      setStats({
        savedRecipes: saved.count ?? 0,
        reservations: reservations.count ?? 0,
        orders: 0,
        co2KgSaved: Number(co2Sum.toFixed(1)),
      });
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  return { stats, loading };
}
