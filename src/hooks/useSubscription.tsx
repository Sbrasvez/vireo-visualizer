import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getStripeEnvironment } from "@/lib/stripe";

export interface SubscriptionRow {
  id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  product_id: string;
  price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
}

export function isAccessActive(s: SubscriptionRow): boolean {
  const periodOk =
    !s.current_period_end || new Date(s.current_period_end).getTime() > Date.now();
  if ((s.status === "active" || s.status === "trialing") && periodOk) return true;
  if (s.status === "canceled" && periodOk) return true;
  return false;
}

export function useSubscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const env = getStripeEnvironment();

  useEffect(() => {
    if (!user) {
      setSub(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("environment", env)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) {
        setSub((data as SubscriptionRow) || null);
        setLoading(false);
      }
    };
    load();

    // Realtime: refresh when subscription row changes
    const channel = supabase
      .channel(`subs-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, env]);

  const active = sub ? isAccessActive(sub) : false;
  const tier: "free" | "pro" | "business" = !sub || !active
    ? "free"
    : sub.product_id === "vireo_business"
    ? "business"
    : "pro";

  return { subscription: sub, loading, isActive: active, tier };
}
