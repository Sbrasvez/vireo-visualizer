import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CO2Entry {
  date: string; // YYYY-MM-DD
  kg: number;
}

export interface CO2Stats {
  totalKg: number;
  weekKg: number;
  daily: CO2Entry[]; // last 7 days, oldest first
  loading: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function useCO2(): CO2Stats {
  const { user } = useAuth();
  const [stats, setStats] = useState<CO2Stats>({ totalKg: 0, weekKg: 0, daily: [], loading: true });

  useEffect(() => {
    if (!user) {
      setStats({ totalKg: 0, weekKg: 0, daily: [], loading: false });
      return;
    }
    let cancel = false;
    (async () => {
      const since = new Date(Date.now() - 6 * DAY_MS);
      since.setHours(0, 0, 0, 0);

      const [allRes, weekRes] = await Promise.all([
        supabase.from("co2_log").select("kg_co2").eq("user_id", user.id),
        supabase
          .from("co2_log")
          .select("kg_co2, created_at")
          .eq("user_id", user.id)
          .gte("created_at", since.toISOString()),
      ]);

      if (cancel) return;

      const totalKg =
        allRes.data?.reduce((s, r: { kg_co2: number | string }) => s + Number(r.kg_co2 || 0), 0) ?? 0;

      // Build daily buckets for last 7 days
      const buckets = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * DAY_MS);
        const key = d.toISOString().slice(0, 10);
        buckets.set(key, 0);
      }
      let weekKg = 0;
      for (const r of weekRes.data || []) {
        const key = new Date((r as { created_at: string }).created_at).toISOString().slice(0, 10);
        if (buckets.has(key)) {
          const v = buckets.get(key)! + Number((r as { kg_co2: number }).kg_co2 || 0);
          buckets.set(key, v);
          weekKg += Number((r as { kg_co2: number }).kg_co2 || 0);
        }
      }
      const daily: CO2Entry[] = Array.from(buckets.entries()).map(([date, kg]) => ({
        date,
        kg: Math.round(kg * 10) / 10,
      }));

      setStats({
        totalKg: Math.round(totalKg * 10) / 10,
        weekKg: Math.round(weekKg * 10) / 10,
        daily,
        loading: false,
      });
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  return stats;
}
