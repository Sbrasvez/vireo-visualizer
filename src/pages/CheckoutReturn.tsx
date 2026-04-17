import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function CheckoutReturn() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const type = params.get("type"); // 'sub' | 'order'
  const { clear } = useCart();

  useEffect(() => {
    // Clear the cart on successful order return — Stripe only redirects here on completion
    if (type === "order" && sessionId) {
      clear();
    }
  }, [type, sessionId, clear]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container max-w-md text-center">
          <div className="inline-grid place-items-center size-20 rounded-full bg-primary/10 text-primary mb-6">
            <CheckCircle2 className="size-10" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">
            {type === "sub"
              ? t("checkout_return.sub_title", "Benvenuto a bordo!")
              : t("checkout_return.order_title", "Grazie per il tuo ordine!")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {type === "sub"
              ? t(
                  "checkout_return.sub_desc",
                  "Il tuo abbonamento è attivo. Tutte le feature premium sono già sbloccate.",
                )
              : t(
                  "checkout_return.order_desc",
                  "Riceverai un'email di conferma con i dettagli della spedizione.",
                )}
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground mb-6 font-mono break-all">
              ID: {sessionId.slice(0, 24)}…
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {type === "sub" ? (
              <>
                <Button asChild>
                  <Link to="/ai">
                    <Sparkles className="size-4 mr-2" />
                    {t("checkout_return.try_ai", "Prova la chat AI illimitata")}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">{t("checkout_return.dashboard", "Vai alla dashboard")}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link to="/profile">{t("checkout_return.view_orders", "Vedi i miei ordini")}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/marketplace">{t("checkout_return.continue_shopping", "Continua lo shopping")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
