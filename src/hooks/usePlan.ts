import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PlanTier = "free" | "pro" | "business";

export interface UserPlan {
  tier: PlanTier;
  plan_expires_at: string | null;
  ai_messages_today: number;
}

export function usePlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan(null);
      setLoading(false);
      return;
    }
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("user_plans")
        .select("tier, plan_expires_at, ai_messages_today")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancel) return;
      setPlan((data as UserPlan) || { tier: "free", plan_expires_at: null, ai_messages_today: 0 });
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  return { plan, loading, isPro: plan?.tier === "pro" || plan?.tier === "business" };
}
