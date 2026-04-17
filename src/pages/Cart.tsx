import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatEur } from "@/lib/catalog";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";

export default function Cart() {
  const { t } = useTranslation();
  const { items, removeItem, setQuantity, totalCents, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const startCheckout = () => {
    if (!user) {
      navigate("/login?redirect=/cart");
      return;
    }
    setCheckingOut(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PaymentTestModeBanner />
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container max-w-3xl">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/marketplace">
              <ArrowLeft className="size-4 mr-1" />
              {t("cart.continue_shopping", "Continua lo shopping")}
            </Link>
          </Button>

          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
            {t("cart.title", "Il tuo carrello")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {count === 0
              ? t("cart.empty", "Il carrello è vuoto.")
              : t("cart.count", { count, defaultValue: "{{count}} articolo/i" })}
          </p>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
              <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">
                {t("cart.empty_title", "Niente nel carrello")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t("cart.empty_desc", "Esplora il marketplace eco di Vireo.")}
              </p>
              <Button asChild>
                <Link to="/marketplace">{t("cart.browse_btn", "Vai al marketplace")}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.priceId}
                  className="flex gap-4 rounded-2xl border border-border/60 bg-card p-3 sm:p-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-20 sm:size-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-sm sm:text-base line-clamp-2">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.priceId)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                        aria-label={t("cart.remove", "Rimuovi")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {formatEur(item.unitAmount)}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="inline-flex items-center rounded-lg border border-border">
                        <button
                          onClick={() => setQuantity(item.priceId, item.quantity - 1)}
                          className="size-8 grid place-items-center hover:bg-accent transition-colors rounded-l-lg"
                          aria-label={t("cart.decrease", "Riduci")}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="px-3 text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.priceId, item.quantity + 1)}
                          className="size-8 grid place-items-center hover:bg-accent transition-colors rounded-r-lg"
                          aria-label={t("cart.increase", "Aumenta")}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <div className="font-display font-bold text-foreground">
                        {formatEur(item.unitAmount * item.quantity)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <div className="rounded-2xl border border-border/60 bg-card p-5 mt-6">
                <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                  <span>{t("cart.subtotal", "Subtotale")}</span>
                  <span>{formatEur(totalCents)}</span>
                </div>
                <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                  <span>{t("cart.shipping", "Spedizione")}</span>
                  <span>{t("cart.shipping_at_checkout", "Calcolata al checkout")}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-3 mb-5">
                  <span className="font-display text-lg font-bold">{t("cart.total", "Totale")}</span>
                  <span className="font-display text-2xl font-bold">{formatEur(totalCents)}</span>
                </div>
                <Button size="lg" className="w-full" onClick={startCheckout}>
                  {t("cart.checkout_btn", "Procedi al checkout")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={checkingOut} onOpenChange={setCheckingOut}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card">
          <DialogTitle className="sr-only">{t("cart.checkout_title", "Completa l'ordine")}</DialogTitle>
          {checkingOut && items.length > 0 && (
            <StripeEmbeddedCheckout
              items={items.map((i) => ({ priceId: i.priceId, quantity: i.quantity }))}
              customerEmail={user?.email || undefined}
              userId={user?.id}
              mode="payment"
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&type=order`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
