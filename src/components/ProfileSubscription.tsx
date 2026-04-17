import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Crown, Zap, Sparkles, Package } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getStripeEnvironment } from "@/lib/stripe";
import { formatEur } from "@/lib/catalog";

interface OrderRow {
  id: string;
  amount_total: number;
  currency: string;
  status: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_amount: number;
  }>;
}

export function ProfileSubscription() {
  const { t } = useTranslation();
  const { subscription, isActive, tier, loading } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, amount_total, currency, status, created_at, order_items(product_name, quantity, unit_amount)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancel) {
        setOrders((data as OrderRow[]) || []);
        setLoadingOrders(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  const openPortal = async () => {
    setOpeningPortal(true);
    const { data, error } = await supabase.functions.invoke("create-portal-session", {
      body: {
        environment: getStripeEnvironment(),
        returnUrl: `${window.location.origin}/profile`,
      },
    });
    setOpeningPortal(false);
    if (error || !data?.url) {
      toast({
        title: t("pricing.portal_error", "Impossibile aprire il portale"),
        description: error?.message || data?.error,
        variant: "destructive",
      });
      return;
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
  };

  const TierIcon = tier === "business" ? Crown : tier === "pro" ? Zap : Sparkles;
  const tierLabel = t(`pricing.plans.${tier}.name`, tier);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <TierIcon className="size-5 text-primary" />
            {t("profile.my_plan", "Il mio piano")}
          </CardTitle>
          <CardDescription>
            {t("profile.plan_desc", "Gestisci abbonamento, fatture e metodo di pagamento")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      tier === "business"
                        ? "bg-tertiary text-tertiary-foreground"
                        : tier === "pro"
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  >
                    {tierLabel}
                  </Badge>
                  {subscription?.cancel_at_period_end && (
                    <Badge variant="outline" className="border-destructive text-destructive">
                      {t("profile.canceling", "Cancellazione in sospeso")}
                    </Badge>
                  )}
                </div>
                {isActive && subscription?.current_period_end && (
                  <span className="text-xs text-muted-foreground">
                    {subscription.cancel_at_period_end
                      ? t("profile.access_until", "Accesso fino al")
                      : t("profile.renews_on", "Rinnova il")}{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {isActive ? (
                  <Button variant="outline" onClick={openPortal} disabled={openingPortal}>
                    {openingPortal && <Loader2 className="size-4 mr-2 animate-spin" />}
                    <ExternalLink className="size-4 mr-2" />
                    {t("pricing.manage_subscription", "Gestisci abbonamento")}
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/pricing">
                      <Zap className="size-4 mr-2" />
                      {t("profile.upgrade", "Passa a Pro")}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Package className="size-5 text-primary" />
            {t("profile.my_orders", "I miei ordini")}
          </CardTitle>
          <CardDescription>{t("profile.orders_desc", "Storico acquisti dal Marketplace")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("profile.no_orders", "Nessun ordine ancora.")}
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {orders.map((o) => (
                <li key={o.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {o.order_items?.map((i) => `${i.quantity}× ${i.product_name}`).join(" · ") ||
                          t("profile.order", "Ordine")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold">{formatEur(o.amount_total)}</div>
                      <Badge variant="outline" className="text-[10px] mt-0.5 capitalize">
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
