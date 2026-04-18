import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, Share2, Trash2, ShoppingBag, Globe, Lock, Copy, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import CTAButton from "@/components/CTAButton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import MotionCard from "@/components/MotionCard";
import { SkeletonWishlistGrid } from "@/components/EditorialSkeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  useMyWishlist,
  useToggleWishlist,
  useUpdateWishlistItem,
  useBulkSetWishlistVisibility,
} from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { formatEur } from "@/lib/catalog";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { data: items = [], isLoading } = useMyWishlist();
  const toggle = useToggleWishlist();
  const updateItem = useUpdateWishlistItem();
  const bulkSet = useBulkSetWishlistVisibility();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const allPublic = useMemo(
    () => items.length > 0 && items.every((i) => i.is_public),
    [items],
  );
  const anyPublic = useMemo(() => items.some((i) => i.is_public), [items]);

  const shareUrl = user ? `${window.location.origin}/wishlist/${user.id}` : "";

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: t("wishlist.link_copied", "Link copiato") });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: t("common.error", "Errore"), variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("wishlist.share_title", "La mia wishlist Vireo"),
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled, fallthrough to copy
      }
    }
    handleCopy();
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container max-w-xl text-center space-y-4">
            <Heart className="size-12 text-muted-foreground mx-auto" />
            <h1 className="font-display text-3xl font-bold">
              {t("wishlist.login_title", "Accedi alla tua wishlist")}
            </h1>
            <p className="text-muted-foreground">
              {t("wishlist.login_desc", "Salva i prodotti che ami e ritrovali ovunque, su ogni dispositivo.")}
            </p>
            <CTAButton size="md" asChild>
              <Link to="/login">{t("nav.login", "Accedi")}</Link>
            </CTAButton>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        {/* Editorial hero */}
        <EditorialPageHeader
          eyebrow={t("wishlist.eyebrow", "I tuoi preferiti")}
          number="03"
          title={t("wishlist.editorial_title_1", "Oggetti che")}
          italic={t("wishlist.editorial_title_2", "amerai a lungo")}
          lead={t(
            "wishlist.editorial_lead",
            "Una collezione personale di pezzi sostenibili: salvali ora, condividili quando vuoi, portali a casa al momento giusto.",
          )}
          aside={
            items.length > 0 ? (
              <Card className="p-5 space-y-3 border-border/60 bg-card/80 backdrop-blur">
                <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                  — {t("wishlist.share_eyebrow", "Condivisione")}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="bulk-public" className="text-sm font-medium flex items-center gap-2">
                    {allPublic ? <Globe className="size-4 text-primary" /> : <Lock className="size-4" />}
                    {t("wishlist.make_public", "Wishlist pubblica")}
                  </Label>
                  <Switch
                    id="bulk-public"
                    checked={allPublic}
                    onCheckedChange={(v) => bulkSet.mutate(v)}
                  />
                </div>
                {anyPublic && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy} className="flex-1 gap-2">
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {t("wishlist.copy_link", "Copia link")}
                    </Button>
                    <Button size="sm" onClick={handleShare} className="flex-1 gap-2">
                      <Share2 className="size-4" />
                      {t("wishlist.share", "Condividi")}
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {anyPublic
                    ? t("wishlist.public_hint", "Chi ha il link può vedere i prodotti contrassegnati come pubblici.")
                    : t("wishlist.private_hint", "Attiva per condividere la tua wishlist con un link.")}
                </p>
              </Card>
            ) : undefined
          }
        />

        {/* Grid */}
        <section className="py-14">
          <div className="container max-w-6xl">
            {!isLoading && items.length > 0 && (
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase mb-2">
                    — {t("wishlist.collection_eyebrow", "La tua collezione")}
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                    {items.length} {items.length === 1
                      ? t("wishlist.item_singular", "pezzo")
                      : t("wishlist.item_plural", "pezzi")}
                  </h2>
                </div>
              </div>
            )}

            {isLoading ? (
              <SkeletonWishlistGrid count={8} />
            ) : items.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-border/60 bg-card max-w-2xl mx-auto">
                <Heart className="size-12 mx-auto text-muted-foreground mb-4" />
                <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
                  — {t("wishlist.empty_eyebrow", "Capitolo vuoto")}
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3">
                  {t("wishlist.empty_title", "Nessun preferito ancora")}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {t("wishlist.empty_desc", "Esplora il marketplace e tocca il cuore sui prodotti che ti piacciono.")}
                </p>
                <CTAButton size="md" asChild>
                  <Link to="/marketplace">
                    <ShoppingBag className="size-4 mr-2" />
                    {t("wishlist.browse_marketplace", "Esplora il marketplace")}
                  </Link>
                </CTAButton>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((it, i) => {
                  const p = it.product;
                  if (!p) return null;
                  const img = p.primary_image ?? p.images?.[0] ?? "/placeholder.svg";
                  const outOfStock = !p.unlimited_stock && p.stock <= 0;
                  return (
                    <MotionCard
                      key={it.id}
                      delay={Math.min(i, 12) * 0.05}
                      lift="medium"
                      className="group rounded-2xl bg-card border border-border/60 overflow-hidden"
                    >
                      <Link to={`/product/${p.slug}`} className="relative aspect-square overflow-hidden bg-muted block">
                        <img
                          src={img}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggle.mutate({ productId: p.id, currentlyIn: true });
                          }}
                          aria-label={t("wishlist.remove_aria", "Rimuovi dai preferiti")}
                          className="absolute top-3 right-3 size-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center text-secondary shadow-soft hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                        {it.is_public && (
                          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground gap-1 font-mono text-[9px] tracking-[0.18em] uppercase">
                            <Globe className="size-3" />
                            {t("wishlist.public", "Pubblico")}
                          </Badge>
                        )}
                      </Link>
                      <div className="p-4 space-y-3">
                        <div>
                          {p.seller?.business_name && (
                            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5 truncate">
                              {p.seller.business_name}
                            </div>
                          )}
                          <Link to={`/product/${p.slug}`}>
                            <h3 className="font-display font-semibold line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5em] leading-snug">
                              {p.name}
                            </h3>
                          </Link>
                          <div className="font-display text-lg font-bold mt-1">
                            {formatEur(p.price_cents)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                            {it.is_public ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
                            <Switch
                              checked={it.is_public}
                              onCheckedChange={(v) =>
                                updateItem.mutate({ id: it.id, patch: { is_public: v } })
                              }
                              aria-label={t("wishlist.toggle_public", "Rendi pubblico")}
                            />
                          </div>
                          <Button
                            size="sm"
                            disabled={outOfStock}
                            className="mt-2"
                            onClick={() => {
                              addItem({
                                priceId: p.id,
                                productId: p.id,
                                name: p.name,
                                image: img,
                                unitAmount: p.price_cents,
                                sellerId: p.seller_id,
                                sellerName: p.seller?.business_name,
                                shippingCents: p.shipping_cents,
                                kind: "seller_product",
                              });
                              toast({
                                title: t("marketplace.added_title", "Aggiunto al carrello"),
                                description: p.name,
                              });
                            }}
                          >
                            <ShoppingBag className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </MotionCard>
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
