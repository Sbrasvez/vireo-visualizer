import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Star, Heart, Recycle, Leaf, Check, Store, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarketplaceProducts, type SellerProduct } from "@/hooks/useSellerProducts";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { formatEur } from "@/lib/catalog";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { key: "all", label: "Tutti" },
  { key: "kitchen", label: "Cucina" },
  { key: "home", label: "Casa" },
  { key: "personal", label: "Persona" },
  { key: "reuse", label: "Riuso" },
  { key: "bio", label: "Bio" },
];

export default function Marketplace() {
  const { t } = useTranslation();
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [reusedOnly, setReusedOnly] = useState(false);

  const { data: products = [], isLoading } = useMarketplaceProducts({
    category,
    search: debouncedSearch || undefined,
    reusedOnly,
  });

  const visible = useMemo(() => products, [products]);

  const handleAdd = (p: SellerProduct) => {
    addItem({
      priceId: p.id,
      productId: p.id,
      name: p.name,
      image: p.primary_image ?? p.images[0] ?? "",
      unitAmount: p.price_cents,
      sellerId: p.seller_id,
      sellerName: p.seller?.business_name,
      shippingCents: p.shipping_cents,
      kind: "seller_product",
    });
    setJustAdded(p.id);
    setTimeout(() => setJustAdded((cur) => (cur === p.id ? null : cur)), 1200);
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
                  <Input
                    placeholder={t("marketplace.search_placeholder")}
                    className="pl-12 h-14 rounded-xl text-base border-border bg-card"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button asChild size="lg" variant="outline" className="h-14 px-6 rounded-xl">
                  <Link to="/sell">
                    <Store className="size-4 mr-2" />
                    Diventa venditore
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                {CATEGORIES.map((c) => (
                  <Badge
                    key={c.key}
                    variant={category === c.key ? "default" : "outline"}
                    className="px-4 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                    onClick={() => setCategory(c.key)}
                  >
                    {c.label}
                  </Badge>
                ))}
                <Badge
                  variant={reusedOnly ? "default" : "outline"}
                  className="px-4 py-1.5 cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors text-sm gap-1"
                  onClick={() => setReusedOnly((v) => !v)}
                >
                  <Recycle className="size-3" /> Solo riuso
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-8 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-border/60 bg-card">
                <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Nessun prodotto trovato</h3>
                <p className="text-sm text-muted-foreground">Prova a cambiare filtro o ricerca.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visible.map((p, i) => {
                  const inCart = items.find((it) => it.priceId === p.id);
                  const recentlyAdded = justAdded === p.id;
                  const img = p.primary_image ?? p.images[0] ?? "/placeholder.svg";
                  const outOfStock = !p.unlimited_stock && p.stock <= 0;
                  return (
                    <article
                      key={p.id}
                      className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover-lift animate-fade-up"
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <Link to={`/product/${p.slug}`} className="relative aspect-square overflow-hidden bg-muted block">
                        <img
                          src={img}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          width={800}
                          height={800}
                        />
                        <button
                          className="absolute top-3 right-3 size-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-secondary transition-colors shadow-soft"
                          aria-label={t("marketplace.favorite")}
                          onClick={(e) => e.preventDefault()}
                        >
                          <Heart className="size-4" />
                        </button>
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {p.is_bio && <Badge className="bg-tertiary text-tertiary-foreground">Bio</Badge>}
                          {p.is_reused && (
                            <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground gap-1">
                              <Recycle className="size-3" /> Riuso
                            </Badge>
                          )}
                          {outOfStock && <Badge variant="destructive">Esaurito</Badge>}
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link
                          to={`/store/${p.seller?.slug}`}
                          className="text-xs text-muted-foreground mb-1 flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Leaf className="size-3 text-primary" />
                          {p.seller?.business_name ?? "Seller"}
                        </Link>
                        <Link to={`/product/${p.slug}`} className="block">
                          <h3 className="font-display font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5em]">
                            {p.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <Star className="size-3.5 fill-tertiary text-tertiary" />
                          <span className="font-medium text-foreground">{(p.rating ?? 0).toFixed(1)}</span>
                          <span>({p.reviews_count})</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="font-display text-xl font-bold text-foreground">
                              {formatEur(p.price_cents)}
                            </div>
                            {p.compare_at_price_cents && (
                              <div className="text-xs text-muted-foreground line-through">
                                {formatEur(p.compare_at_price_cents)}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={recentlyAdded ? "default" : "outline"}
                            className="rounded-lg"
                            onClick={() => handleAdd(p)}
                            disabled={outOfStock}
                            aria-label={t("marketplace.add_to_cart", "Aggiungi al carrello")}
                          >
                            {recentlyAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
                            {inCart && !recentlyAdded ? <span className="ml-1 text-xs">×{inCart.quantity}</span> : null}
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

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
