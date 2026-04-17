import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Star, Heart, Recycle, Leaf, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MARKETPLACE_PRODUCTS, formatEur } from "@/lib/catalog";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

export default function Marketplace() {
  const { t } = useTranslation();
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const categories = [
    t("marketplace.categories.all"),
    t("marketplace.categories.kitchen"),
    t("marketplace.categories.home"),
    t("marketplace.categories.personal"),
    t("marketplace.categories.reuse"),
    t("marketplace.categories.bio"),
  ];

  const handleAdd = (p: typeof MARKETPLACE_PRODUCTS[number]) => {
    addItem({
      priceId: p.priceId,
      productId: p.productId,
      name: p.name,
      image: p.img,
      unitAmount: p.priceCents,
    });
    setJustAdded(p.priceId);
    setTimeout(() => setJustAdded((cur) => (cur === p.priceId ? null : cur)), 1200);
    toast({
      title: t("marketplace.added_title", "Aggiunto al carrello"),
      description: p.name,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PaymentTestModeBanner />
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-16 gradient-soft overflow-hidden">
          <div className="absolute top-10 right-10 size-80 rounded-full bg-tertiary/15 blur-3xl animate-float" />
          <div className="container relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-up">
                <Recycle className="size-4" />
                <span>{t("marketplace.badge")}</span>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold mb-5 text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
                {t("marketplace.title_1")} <span className="italic text-gradient-leaf">{t("marketplace.title_2")}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
                {t("marketplace.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="relative flex-1">
                  <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input placeholder={t("marketplace.search_placeholder")} className="pl-12 h-14 rounded-xl text-base border-border bg-card" />
                </div>
                <Button size="lg" className="h-14 px-8 rounded-xl shadow-elegant">{t("marketplace.search_btn")}</Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                {categories.map((c, i) => (
                  <Badge key={c} variant={i === 0 ? "default" : "outline"} className="px-4 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {MARKETPLACE_PRODUCTS.map((p, i) => {
                const inCart = items.find((it) => it.priceId === p.priceId);
                const recentlyAdded = justAdded === p.priceId;
                return (
                  <article key={p.id} className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover-lift animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" width={800} height={800} />
                      <button className="absolute top-3 right-3 size-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-secondary transition-colors shadow-soft" aria-label={t("marketplace.favorite")}>
                        <Heart className="size-4" />
                      </button>
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {p.badge && <Badge className="bg-tertiary text-tertiary-foreground">{p.badge}</Badge>}
                        {p.reused && (
                          <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground gap-1">
                            <Recycle className="size-3" /> {t("marketplace.reuse_badge")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Leaf className="size-3 text-primary" />
                        {p.seller}
                      </p>
                      <h3 className="font-display font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5em]">{p.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <Star className="size-3.5 fill-tertiary text-tertiary" />
                        <span className="font-medium text-foreground">{p.rating}</span>
                        <span>({p.reviews})</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="font-display text-xl font-bold text-foreground">{formatEur(p.priceCents)}</div>
                          {p.oldPriceCents && <div className="text-xs text-muted-foreground line-through">{formatEur(p.oldPriceCents)}</div>}
                        </div>
                        <Button
                          size="sm"
                          variant={recentlyAdded ? "default" : "outline"}
                          className="rounded-lg"
                          onClick={() => handleAdd(p)}
                          aria-label={t("marketplace.add_to_cart", "Aggiungi al carrello")}
                        >
                          {recentlyAdded ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                          {inCart && !recentlyAdded ? <span className="ml-1 text-xs">×{inCart.quantity}</span> : null}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link to="/cart">
                  <ShoppingBag className="size-4 mr-2" />
                  {t("cart.view_cart", "Vai al carrello")}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
