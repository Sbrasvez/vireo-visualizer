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
        <section className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-tertiary/15 to-secondary/20 overflow-hidden">
          {seller.cover_url && (
            <img src={seller.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </section>

        <div className="container max-w-5xl -mt-20 relative">
          <div className="bg-card rounded-2xl border border-border/60 p-6 md:p-8 shadow-elegant">
            <div className="flex items-start gap-5 flex-wrap">
              <div className="size-24 rounded-2xl bg-primary/10 grid place-items-center overflow-hidden shrink-0">
                {seller.logo_url ? (
                  <img src={seller.logo_url} alt={seller.business_name} className="w-full h-full object-cover" />
                ) : (
                  <Leaf className="size-10 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="font-display text-3xl md:text-4xl font-bold">{seller.business_name}</h1>
                  {seller.is_demo && <Badge variant="secondary">{t("store.demo")}</Badge>}
                  <Badge className="bg-primary/10 text-primary">{t("store.verified")}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-tertiary text-tertiary" />
                    <strong className="text-foreground">{(seller.rating ?? 0).toFixed(1)}</strong>
                  </span>
                  <span>{t("store.orders", { count: seller.total_orders })}</span>
                  {seller.category && <Badge variant="outline">{seller.category}</Badge>}
                </div>
                {seller.description && <p className="text-muted-foreground">{seller.description}</p>}
              </div>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold mt-12 mb-6">{t("store.products_count", { count: products.length })}</h2>

          {loadingProducts ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-border/60 bg-card">
              <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("store.no_products")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p, i) => {
                const recentlyAdded = justAdded === p.id;
                const img = p.primary_image ?? p.images[0] ?? "/placeholder.svg";
                const outOfStock = !p.unlimited_stock && p.stock <= 0;
                return (
                  <article key={p.id} className="rounded-2xl bg-card border border-border/60 overflow-hidden hover-lift animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                    <Link to={`/product/${p.slug}`} className="relative aspect-square overflow-hidden bg-muted block">
                      <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {p.is_bio && <Badge className="bg-tertiary text-tertiary-foreground">Bio</Badge>}
                        {p.is_reused && <Badge variant="secondary" className="gap-1"><Recycle className="size-3" />{t("seller_dashboard.reused")}</Badge>}
                        {outOfStock && <Badge variant="destructive">{t("store.out_of_stock")}</Badge>}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${p.slug}`} className="block hover:text-primary transition-colors">
                        <h3 className="font-display font-semibold mb-2 line-clamp-2 min-h-[2.5em]">{p.name}</h3>
                      </Link>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="font-display text-xl font-bold">{formatEur(p.price_cents)}</div>
                          {p.compare_at_price_cents && <div className="text-xs text-muted-foreground line-through">{formatEur(p.compare_at_price_cents)}</div>}
                        </div>
                        <Button size="sm" variant={recentlyAdded ? "default" : "outline"} onClick={() => handleAdd(p)} disabled={outOfStock}>
                          {recentlyAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
                        </Button>
                      </div>
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
