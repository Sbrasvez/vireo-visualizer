import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { PLANS, formatEur, type PlanTierId } from "@/lib/catalog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

const ICONS: Record<PlanTierId, typeof Sparkles> = {
  free: Sparkles,
  pro: Zap,
  business: Crown,
};

export default function Pricing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tier: currentTier, subscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  const startCheckout = (priceId: string) => {
    if (!user) {
      navigate("/login?redirect=/pricing");
      return;
    }
    setCheckoutPriceId(priceId);
  };

  const openPortal = async () => {
    setOpeningPortal(true);
    const { data, error } = await supabase.functions.invoke("create-portal-session", {
      body: {
        environment: getStripeEnvironment(),
        returnUrl: `${window.location.origin}/pricing`,
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PaymentTestModeBanner />
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <section className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-5">
              <Sparkles className="size-4 text-primary" />
              <span>{t("pricing.eyebrow", "Scegli il tuo piano")}</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold mb-4 text-balance">
              {t("pricing.title", "Cresci con")}{" "}
              <span className="italic text-gradient-leaf">Vireo</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {t(
                "pricing.subtitle",
                "Inizia gratis. Sblocca chat AI illimitata, ricette salvate illimitate e prenotazioni prioritarie quando sei pronto.",
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => {
              const Icon = ICONS[plan.id];
              const isCurrent = currentTier === plan.id;
              const isHighlight = plan.highlight;
              return (
                <article
                  key={plan.id}
                  className={`relative rounded-2xl border p-7 flex flex-col ${
                    isHighlight
                      ? "border-primary bg-card shadow-elegant ring-2 ring-primary/20"
                      : "border-border/60 bg-card"
                  }`}
                >
                  {isHighlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide">
                      {t("pricing.most_popular", "Più scelto")}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="size-5 text-primary" />
                    <h3 className="font-display text-2xl font-bold capitalize">
                      {t(`pricing.plans.${plan.id}.name`, plan.id)}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 min-h-[2.5em]">
                    {t(`pricing.plans.${plan.id}.tagline`, "")}
                  </p>
                  <div className="mb-6">
                    {plan.amountCents === 0 ? (
                      <div className="font-display text-4xl font-bold">
                        {t("pricing.free", "Gratis")}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold">
                          {formatEur(plan.amountCents)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          / {t("pricing.month", "mese")}
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-7 flex-1">
                    {plan.featuresKeys.map((k) => (
                      <li key={k} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/90">
                          {t(`pricing.features.${k}`, k)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === "free" ? (
                    <Button variant="outline" disabled className="w-full">
                      {isCurrent
                        ? t("pricing.current_plan", "Piano attuale")
                        : t("pricing.always_free", "Sempre gratis")}
                    </Button>
                  ) : isCurrent ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={openPortal}
                      disabled={openingPortal}
                    >
                      {openingPortal && <Loader2 className="size-4 mr-2 animate-spin" />}
                      {t("pricing.manage_subscription", "Gestisci abbonamento")}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isHighlight ? "default" : "secondary"}
                      onClick={() => startCheckout(plan.priceId!)}
                    >
                      {subscription
                        ? t("pricing.switch_plan", "Cambia piano")
                        : t("pricing.subscribe", "Abbonati")}
                    </Button>
                  )}
                </article>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-10">
            {t(
              "pricing.disclaimer",
              "Puoi cancellare in qualsiasi momento dal portale clienti. IVA inclusa dove applicabile.",
            )}
          </p>
        </section>
      </main>
      <Footer />

      <Dialog open={!!checkoutPriceId} onOpenChange={(o) => !o && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card">
          <DialogTitle className="sr-only">{t("pricing.checkout_title", "Completa l'abbonamento")}</DialogTitle>
          {checkoutPriceId && (
            <StripeEmbeddedCheckout
              items={[{ priceId: checkoutPriceId, quantity: 1 }]}
              customerEmail={user?.email || undefined}
              userId={user?.id}
              mode="subscription"
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&type=sub`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
