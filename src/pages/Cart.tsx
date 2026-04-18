import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { Button } from "@/components/ui/button";
import CTAButton from "@/components/CTAButton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatEur } from "@/lib/catalog";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";

export default function Cart() {
  const { t } = useTranslation();
  const { items, removeItem, setQuantity, totalCents, count, shippingCents } = useCart();
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
          <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 rounded-full text-muted-foreground hover:text-foreground">
            <Link to="/marketplace">
              <ArrowLeft className="size-4 mr-1.5" />
              {t("cart.continue_shopping", "Continua lo shopping")}
            </Link>
          </Button>

          {/* Editorial header */}
          <div className="mb-10 animate-fade-in">
            <EditorialPageHeader
              surface="plain"
              containerClassName="max-w-3xl px-0"
              eyebrow={`Checkout · ${count} ${count === 1 ? "articolo" : "articoli"}`}
              title={t("cart.title", "Il tuo")}
              italic="carrello"
              trailing="."
              lead={
                count === 0
                  ? t("cart.empty", "Il carrello è vuoto.")
                  : "Rivedi la tua selezione prima di completare l'ordine."
              }
            />
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 bg-card p-16 text-center">
              <div className="size-16 mx-auto rounded-full bg-muted grid place-items-center mb-5">
                <ShoppingBag className="size-7 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-light mb-2">
                {t("cart.empty_title", "Niente nel carrello")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                {t("cart.empty_desc", "Esplora il marketplace eco di Vireo.")}
              </p>
              <Button asChild className="rounded-full">
                <Link to="/marketplace">{t("cart.browse_btn", "Vai al marketplace")}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  La tua selezione
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {items.map((item, i) => (
                <article
                  key={item.priceId}
                  className="group flex gap-4 rounded-2xl border border-border/60 bg-card p-3 sm:p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_10px_30px_-15px_hsl(var(--primary)/0.2)]"
                >
                  <div className="relative shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-24 sm:size-28 object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-1.5 left-1.5 font-mono text-[9px] tracking-[0.18em] uppercase text-white/90 bg-black/40 backdrop-blur px-1.5 py-0.5 rounded">
                      N°{String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-medium text-base sm:text-lg leading-tight line-clamp-2">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.priceId)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1.5 -mt-1 -mr-1 rounded-full hover:bg-destructive/10"
                        aria-label={t("cart.remove", "Rimuovi")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono tracking-wider">
                      {formatEur(item.unitAmount)}
                      {item.sellerName && <span className="ml-2">· {item.sellerName}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <div className="inline-flex items-center rounded-full border border-border bg-background">
                        <button
                          onClick={() => setQuantity(item.priceId, item.quantity - 1)}
                          className="size-8 grid place-items-center hover:bg-accent transition-colors rounded-l-full"
                          aria-label={t("cart.decrease", "Riduci")}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="px-3 text-sm font-mono tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.priceId, item.quantity + 1)}
                          className="size-8 grid place-items-center hover:bg-accent transition-colors rounded-r-full"
                          aria-label={t("cart.increase", "Aumenta")}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <div className="font-display text-lg font-medium text-foreground tabular-nums">
                        {formatEur(item.unitAmount * item.quantity)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <div className="rounded-3xl border border-border/60 bg-card p-6 mt-8 space-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-primary/40" />
                  <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary">
                    Riepilogo
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground py-1.5">
                  <span>{t("cart.subtotal", "Subtotale")}</span>
                  <span className="font-mono tabular-nums">{formatEur(totalCents)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground py-1.5">
                  <span>{t("cart.shipping", "Spedizione")}</span>
                  <span className="font-mono tabular-nums">
                    {shippingCents > 0 ? formatEur(shippingCents) : "Gratis"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-border/60 pt-4 mt-3 mb-5">
                  <span className="font-display text-lg font-light">
                    {t("cart.total", "Totale")}
                  </span>
                  <span className="font-display text-3xl font-light tabular-nums">
                    {formatEur(totalCents + shippingCents)}
                  </span>
                </div>
                <CTAButton size="lg" className="w-full" onClick={startCheckout}>
                  {t("cart.checkout_btn", "Procedi al checkout")}
                </CTAButton>
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
