import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ShoppingBag, ArrowLeft, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePublicWishlist } from "@/hooks/useWishlist";
import { formatEur } from "@/lib/catalog";

export default function PublicWishlist() {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading } = usePublicWishlist(userId);

  const items = data?.items ?? [];
  const owner = data?.owner;
  const ownerName = owner?.display_name ?? t("wishlist.someone", "Qualcuno");
  const initials = (ownerName ?? "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <section className="gradient-soft py-14">
          <div className="container max-w-5xl">
            <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
              <Link to="/marketplace">
                <ArrowLeft className="size-4" /> {t("product_detail.back_to_marketplace", "Torna al marketplace")}
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-secondary/40">
                <AvatarImage src={owner?.avatar_url ?? undefined} alt={ownerName} />
                <AvatarFallback className="bg-secondary/20 text-secondary font-semibold">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-medium mb-2">
                  <Heart className="size-3" />
                  <span>{t("wishlist.public_badge", "Wishlist pubblica")}</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold">
                  {t("wishlist.public_title", "I preferiti di {{name}}", { name: ownerName })}
                </h1>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container max-w-5xl">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-border/60 bg-card">
                <Heart className="size-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">
                  {t("wishlist.public_empty_title", "Nessun prodotto pubblico")}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("wishlist.public_empty_desc", "Questa wishlist non contiene ancora prodotti condivisi.")}
                </p>
                <Button asChild>
                  <Link to="/marketplace">
                    <ShoppingBag className="size-4 mr-2" />
                    {t("wishlist.browse_marketplace", "Esplora il marketplace")}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((it) => {
                  const p = it.product;
                  if (!p) return null;
                  const img = p.primary_image ?? p.images?.[0] ?? "/placeholder.svg";
                  return (
                    <Link
                      key={it.id}
                      to={`/product/${p.slug}`}
                      className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover-lift"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={img}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        {p.seller?.business_name && (
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Leaf className="size-3 text-primary" />
                            {p.seller.business_name}
                          </div>
                        )}
                        <h3 className="font-display font-semibold line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5em]">
                          {p.name}
                        </h3>
                        <div className="font-display text-lg font-bold mt-2">
                          {formatEur(p.price_cents)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
