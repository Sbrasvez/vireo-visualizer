import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSellerBySlug } from "@/hooks/useSeller";
import { useMarketplaceProducts, type SellerProduct } from "@/hooks/useSellerProducts";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Recycle, Leaf, Plus, Check, ArrowLeft, ShoppingBag } from "lucide-react";
import { formatEur } from "@/lib/catalog";
import { useToast } from "@/hooks/use-toast";

export default function Store() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: seller, isLoading: loadingSeller } = useSellerBySlug(slug);
  const { data: products = [], isLoading: loadingProducts } = useMarketplaceProducts({ sellerId: seller?.id });
  const { addItem } = useCart();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = useState<string | null>(null);

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
    toast({ title: t("store.added_title"), description: p.name });
  };

  if (loadingSeller) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-28 container max-w-5xl space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-8 w-1/3" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 container max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold mb-4">{t("store.not_found")}</h1>
          <Button asChild><Link to="/marketplace"><ArrowLeft className="size-4 mr-2" />{t("store.back_to_marketplace")}</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        {/* Cover — editorial */}
        <section className="relative h-72 md:h-96 overflow-hidden border-b border-border/50">
          {seller.cover_url ? (
            <img src={seller.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 gradient-soft" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </section>

        <div className="container max-w-6xl -mt-28 md:-mt-32 relative">
          {/* Atelier identity card */}
          <div className="bg-card rounded-2xl border border-border/40 p-6 md:p-10 shadow-elegant">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">— Atelier</span>
              <span className="h-px flex-1 max-w-[60px] bg-border" />
              {seller.is_demo && <Badge variant="secondary" className="font-mono text-[10px] tracking-wider uppercase">{t("store.demo")}</Badge>}
              <Badge className="bg-primary/10 text-primary border-0 font-mono text-[10px] tracking-wider uppercase gap-1">
                <Leaf className="size-3" /> {t("store.verified")}
              </Badge>
            </div>
            <div className="flex items-start gap-6 flex-wrap">
              <div className="size-20 md:size-24 rounded-2xl bg-primary/10 grid place-items-center overflow-hidden shrink-0 border border-border/40">
                {seller.logo_url ? (
                  <img src={seller.logo_url} alt={seller.business_name} className="w-full h-full object-cover" />
                ) : (
                  <Leaf className="size-10 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-[200px]">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight mb-4 text-balance">
                  {seller.business_name}
                </h1>
                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <Star className="size-3.5 fill-tertiary text-tertiary" />
                    <strong className="text-foreground font-display text-base font-normal">{(seller.rating ?? 0).toFixed(1)}</strong>
                  </span>
                  <span>·</span>
                  <span>{t("store.orders", { count: seller.total_orders })}</span>
                  {seller.category && (
                    <>
                      <span>·</span>
                      <span>{seller.category}</span>
                    </>
                  )}
                </div>
                {seller.description && (
                  <p className="text-muted-foreground leading-relaxed font-display italic max-w-2xl">{seller.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Editorial section header */}
          <div className="flex items-end justify-between gap-6 mt-16 mb-10 pb-6 border-b border-border/60 flex-wrap">
            <div>
              <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
                — {t("store.collection_eyebrow", "La collezione")}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
                {t("store.products_count", { count: products.length })}
              </h2>
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/5] rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-card/50">
              <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("store.no_products")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {products.map((p, i) => {
                const recentlyAdded = justAdded === p.id;
                const img = p.primary_image ?? p.images[0] ?? "/placeholder.svg";
                const outOfStock = !p.unlimited_stock && p.stock <= 0;
                return (
                  <article
                    key={p.id}
                    className="group animate-fade-up"
                    style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}
                  >
                    <Link to={`/product/${p.slug}`} className="relative aspect-[4/5] overflow-hidden bg-muted block rounded-xl mb-4">
                      <img
                        src={img}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {p.is_bio && <Badge className="bg-tertiary text-tertiary-foreground font-mono text-[10px] tracking-wider uppercase">Bio</Badge>}
                        {p.is_reused && <Badge variant="secondary" className="gap-1 font-mono text-[10px] tracking-wider uppercase"><Recycle className="size-3" />{t("seller_dashboard.reused")}</Badge>}
                        {outOfStock && <Badge variant="destructive" className="font-mono text-[10px] tracking-wider uppercase">{t("store.out_of_stock")}</Badge>}
                      </div>
                    </Link>
                    <Link to={`/product/${p.slug}`} className="block">
                      <h3 className="font-display text-lg font-normal leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.6em]">{p.name}</h3>
                    </Link>
                    <div className="flex items-end justify-between pt-3 border-t border-border/50">
                      <div>
                        <div className="font-display text-2xl font-light">{formatEur(p.price_cents)}</div>
                        {p.compare_at_price_cents && <div className="text-xs text-muted-foreground line-through">{formatEur(p.compare_at_price_cents)}</div>}
                      </div>
                      <Button
                        size="sm"
                        variant={recentlyAdded ? "default" : "outline"}
                        onClick={() => handleAdd(p)}
                        disabled={outOfStock}
                        className="rounded-full h-9 w-9 p-0 transition-transform hover:scale-110"
                      >
                        {recentlyAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
