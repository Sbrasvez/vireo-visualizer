import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Star, Recycle, Leaf, Check, Store, Plus, ArrowRight } from "lucide-react";
import marketplaceHero from "@/assets/home-marketplace.jpg";
import { WishlistButton } from "@/components/WishlistButton";
import MotionCard from "@/components/MotionCard";
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
        {/* HERO — editorial Tactile Market */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0">
            <img
              src={marketplaceHero}
              alt=""
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/40" />
          </div>
          <div className="relative container py-20 lg:py-28">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6 animate-fade-up">
                <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">N°02</span>
                <span className="h-px flex-1 max-w-[60px] bg-border" />
                <div className="inline-flex items-center gap-2 text-xs font-medium text-secondary uppercase tracking-wider">
                  <Recycle className="size-3.5" />
                  {t("marketplace.badge")}
                </div>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-[0.95] mb-6 text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
                {t("marketplace.title_1")}{" "}
                <em className="italic font-normal text-secondary">{t("marketplace.title_2")}</em>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
                {t("marketplace.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="relative flex-1">
                  <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    placeholder={t("marketplace.search_placeholder")}
                    className="pl-12 h-14 rounded-xl text-base border-border bg-card/95 backdrop-blur-sm shadow-soft"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button asChild size="lg" variant="outline" className="h-14 px-6 rounded-xl bg-card/95 backdrop-blur-sm">
                  <Link to="/sell">
                    <Store className="size-4 mr-2" />
                    {t("marketplace.become_seller")}
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                {CATEGORIES.map((c) => (
                  <Badge
                    key={c.key}
                    variant={category === c.key ? "default" : "outline"}
                    className="px-4 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm bg-card/80 backdrop-blur-sm"
                    onClick={() => setCategory(c.key)}
                  >
                    {t(`marketplace.categories.${c.key}`, c.label)}
                  </Badge>
                ))}
                <Badge
                  variant={reusedOnly ? "default" : "outline"}
                  className="px-4 py-1.5 cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors text-sm gap-1 bg-card/80 backdrop-blur-sm"
                  onClick={() => setReusedOnly((v) => !v)}
                >
                  <Recycle className="size-3" /> {t("marketplace.reused_only")}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container">
            <div className="flex items-end justify-between gap-6 mb-10 pb-6 border-b border-border/60 flex-wrap">
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
                  — {t("marketplace.section_eyebrow", "Curated selection")}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
                  {t("marketplace.section_title", "Oggetti che")}{" "}
                  <em className="italic text-primary">{t("marketplace.section_title_em", "raccontano una storia")}</em>
                </h2>
              </div>
              {!isLoading && visible.length > 0 && (
                <p className="text-sm text-muted-foreground font-mono">
                  {visible.length} {t("marketplace.items_count", "pezzi disponibili")}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-card/50">
                <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-2xl font-light mb-2">{t("marketplace.no_results")}</h3>
                <p className="text-sm text-muted-foreground">{t("marketplace.no_results_desc")}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {visible.map((p, i) => {
                  const inCart = items.find((it) => it.priceId === p.id);
                  const recentlyAdded = justAdded === p.id;
                  const img = p.primary_image ?? p.images[0] ?? "/placeholder.svg";
                  const outOfStock = !p.unlimited_stock && p.stock <= 0;
                  return (
                    <MotionCard
                      key={p.id}
                      delay={Math.min(i, 12) * 0.04}
                      lift="medium"
                      className="group rounded-xl"
                    >
                      <Link to={`/product/${p.slug}`} className="relative aspect-[4/5] overflow-hidden bg-muted block rounded-xl mb-4">
                        <img
                          src={img}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                          width={800}
                          height={1000}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <WishlistButton productId={p.id} className="absolute top-3 right-3" />
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {p.is_bio && <Badge className="bg-tertiary text-tertiary-foreground font-mono text-[10px] tracking-wider uppercase">Bio</Badge>}
                          {p.is_reused && (
                            <Badge variant="secondary" className="bg-secondary/95 text-secondary-foreground gap-1 font-mono text-[10px] tracking-wider uppercase">
                              <Recycle className="size-3" /> {t("marketplace.reuse_badge")}
                            </Badge>
                          )}
                          {outOfStock && <Badge variant="destructive" className="font-mono text-[10px] tracking-wider uppercase">{t("marketplace.out_of_stock")}</Badge>}
                        </div>
                      </Link>
                      <div>
                        <Link
                          to={`/store/${p.seller?.slug}`}
                          className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                          <Leaf className="size-3 text-primary" />
                          {p.seller?.business_name ?? "Seller"}
                        </Link>
                        <Link to={`/product/${p.slug}`} className="block">
                          <h3 className="font-display text-lg font-normal leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.6em]">
                            {p.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Star className="size-3.5 fill-tertiary text-tertiary" />
                          <span className="font-medium text-foreground">{(p.rating ?? 0).toFixed(1)}</span>
                          <span>({p.reviews_count})</span>
                        </div>
                        <div className="flex items-end justify-between pt-3 border-t border-border/50">
                          <div>
                            <div className="font-display text-2xl font-light text-foreground">
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
                            className="rounded-full h-9 w-9 p-0 transition-transform hover:scale-110"
                            onClick={() => handleAdd(p)}
                            disabled={outOfStock}
                            aria-label={t("marketplace.add_to_cart", "Aggiungi al carrello")}
                          >
                            {recentlyAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
                          </Button>
                        </div>
                        {inCart && !recentlyAdded && (
                          <div className="text-[11px] font-mono text-primary mt-2 uppercase tracking-wider">
                            ×{inCart.quantity} {t("marketplace.in_cart", "nel carrello")}
                          </div>
                        )}
                      </div>
                    </MotionCard>
                  );
                })}
              </div>
            )}

            <div className="text-center mt-16">
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 group">
                <Link to="/cart">
                  <ShoppingBag className="size-4 mr-2" />
                  {t("cart.view_cart", "Vai al carrello")}
                  <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
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
