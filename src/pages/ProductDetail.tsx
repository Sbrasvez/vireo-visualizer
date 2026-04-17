import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Leaf,
  Minus,
  Plus,
  Recycle,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProductDetail, useRelatedProducts } from "@/hooks/useProductDetail";
import {
  useProductReviews,
  useMyProductReview,
  useUpsertProductReview,
  useDeleteProductReview,
} from "@/hooks/useProductReviews";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatEur } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { SellerProduct } from "@/hooks/useSellerProducts";

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            "transition-colors",
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
          aria-label={`${i} stelle`}
        >
          <Star
            className={cn(
              "size-7",
              i <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/50",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ProductCardSmall({ p, onAdd }: { p: SellerProduct; onAdd: (p: SellerProduct) => void }) {
  return (
    <article className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover-lift">
      <Link to={`/product/${p.slug}`} className="block aspect-square overflow-hidden bg-muted">
        {p.primary_image || p.images[0] ? (
          <img
            src={p.primary_image ?? p.images[0]}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted-foreground">
            <ShoppingBag className="size-8" />
          </div>
        )}
      </Link>
      <div className="p-4 space-y-2">
        <Link
          to={`/product/${p.slug}`}
          className="block font-medium leading-snug line-clamp-2 hover:text-primary"
        >
          {p.name}
        </Link>
        <div className="flex items-center justify-between">
          <span className="font-semibold">{formatEur(p.price_cents)}</span>
          <Button size="sm" variant="secondary" onClick={() => onAdd(p)} className="gap-1">
            <Plus className="size-4" /> Aggiungi
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem } = useCart();

  const { data: product, isLoading } = useProductDetail(slug);
  const { data: reviews = [] } = useProductReviews(product?.id);
  const { data: myReview } = useMyProductReview(product?.id);
  const { data: related = [] } = useRelatedProducts(product?.seller_id, product?.id);
  const upsertReview = useUpsertProductReview(product?.id);
  const deleteReview = useDeleteProductReview(product?.id);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const [rating, setRating] = useState(myReview?.rating ?? 5);
  const [title, setTitle] = useState(myReview?.title ?? "");
  const [body, setBody] = useState(myReview?.body ?? "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-28 container max-w-6xl space-y-6">
          <Skeleton className="h-8 w-40" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-28 container max-w-3xl text-center space-y-4">
          <h1 className="font-display text-3xl">Prodotto non trovato</h1>
          <p className="text-muted-foreground">
            Il prodotto che cerchi non esiste o non è più disponibile.
          </p>
          <Button asChild>
            <Link to="/marketplace">
              <ArrowLeft className="size-4 mr-2" /> Torna al marketplace
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const gallery = product.images?.length ? product.images : product.primary_image ? [product.primary_image] : [];
  const current = gallery[activeImage] ?? product.primary_image ?? "";
  const inStock = product.unlimited_stock || product.stock > 0;
  const maxQty = product.unlimited_stock ? 99 : Math.max(1, product.stock);
  const discount =
    product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents
      ? Math.round(
          ((product.compare_at_price_cents - product.price_cents) /
            product.compare_at_price_cents) *
            100,
        )
      : 0;

  const handleAdd = (qtyToAdd = qty) => {
    addItem(
      {
        priceId: product.id,
        productId: product.id,
        name: product.name,
        image: product.primary_image ?? product.images[0] ?? "",
        unitAmount: product.price_cents,
        sellerId: product.seller_id,
        sellerName: product.seller?.business_name,
        shippingCents: product.shipping_cents,
        kind: "seller_product",
      },
      qtyToAdd,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    toast({ title: "Aggiunto al carrello", description: product.name });
  };

  const handleAddRelated = (p: SellerProduct) => {
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
    toast({ title: "Aggiunto al carrello", description: p.name });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Login richiesto", description: "Accedi per lasciare una recensione" });
      return;
    }
    upsertReview.mutate({
      rating,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
      author_name:
        (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "Cliente",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-6xl">
          <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
            <Link to="/marketplace">
              <ArrowLeft className="size-4" /> Marketplace
            </Link>
          </Button>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border/60">
                {current ? (
                  <img
                    src={current}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground">
                    <ShoppingBag className="size-16" />
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                    -{discount}%
                  </Badge>
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {product.is_reused && (
                    <Badge className="bg-tertiary text-tertiary-foreground gap-1">
                      <Recycle className="size-3" /> Riuso
                    </Badge>
                  )}
                  {product.is_bio && (
                    <Badge className="bg-primary text-primary-foreground gap-1">
                      <Leaf className="size-3" /> Bio
                    </Badge>
                  )}
                </div>
              </div>

              {gallery.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {gallery.map((img, i) => (
                    <button
                      key={img + i}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                        activeImage === i
                          ? "border-primary shadow-md"
                          : "border-transparent opacity-70 hover:opacity-100",
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {product.seller && (
                <Link
                  to={`/store/${product.seller.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Avatar className="size-6">
                    <AvatarImage src={product.seller.logo_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {product.seller.business_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>Venduto da <span className="font-medium text-foreground">{product.seller.business_name}</span></span>
                </Link>
              )}

              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 text-sm">
                  <Stars value={Number(product.rating ?? 0)} />
                  <span className="text-muted-foreground">
                    {Number(product.rating ?? 0).toFixed(1)} · {product.reviews_count} recensioni
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-3">
                <span className="font-display text-4xl font-bold">{formatEur(product.price_cents)}</span>
                {product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents && (
                  <span className="text-lg text-muted-foreground line-through mb-1">
                    {formatEur(product.compare_at_price_cents)}
                  </span>
                )}
              </div>

              {product.short_description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.short_description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="size-4" />
                  {product.shipping_cents === 0
                    ? "Spedizione gratuita"
                    : `Spedizione ${formatEur(product.shipping_cents)}`}
                </span>
                <span>·</span>
                <span className={cn(inStock ? "text-primary" : "text-destructive")}>
                  {inStock
                    ? product.unlimited_stock
                      ? "Disponibile"
                      : `${product.stock} disponibili`
                    : "Esaurito"}
                </span>
              </div>

              {/* Quantity + Add */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="inline-flex items-center rounded-full border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="size-10 grid place-items-center text-muted-foreground hover:text-foreground transition"
                    aria-label="Diminuisci"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    className="size-10 grid place-items-center text-muted-foreground hover:text-foreground transition"
                    aria-label="Aumenta"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Button
                  size="lg"
                  onClick={() => handleAdd()}
                  disabled={!inStock}
                  className="flex-1 sm:flex-none gap-2 min-w-48"
                >
                  {justAdded ? (
                    <>
                      <Check className="size-5" /> Aggiunto!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="size-5" /> Aggiungi al carrello
                    </>
                  )}
                </Button>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <section className="mt-16 max-w-3xl">
              <h2 className="font-display text-2xl font-semibold mb-4">Descrizione</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </section>
          )}

          {/* Reviews */}
          <section className="mt-16">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold">Recensioni</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Stars value={Number(product.rating ?? 0)} />
                  <span>
                    {Number(product.rating ?? 0).toFixed(1)} su 5 · {product.reviews_count} recensioni
                  </span>
                </div>
              </div>
            </div>

            {/* Review form */}
            {user ? (
              <form
                onSubmit={handleSubmitReview}
                className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 mb-8"
              >
                <div>
                  <Label className="mb-2 block">Il tuo voto</Label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                <div>
                  <Label htmlFor="review-title" className="mb-2 block">
                    Titolo (opzionale)
                  </Label>
                  <Input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Riassumi la tua esperienza"
                    maxLength={120}
                  />
                </div>
                <div>
                  <Label htmlFor="review-body" className="mb-2 block">
                    Recensione (opzionale)
                  </Label>
                  <Textarea
                    id="review-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Cosa ti è piaciuto? Cosa miglioreresti?"
                    rows={4}
                    maxLength={2000}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {myReview ? "Stai aggiornando la tua recensione esistente." : "Pubblica la tua recensione."}
                  </p>
                  <div className="flex gap-2">
                    {myReview && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => deleteReview.mutate()}
                        disabled={deleteReview.isPending}
                      >
                        Elimina
                      </Button>
                    )}
                    <Button type="submit" disabled={upsertReview.isPending}>
                      {upsertReview.isPending ? "Invio..." : myReview ? "Aggiorna" : "Pubblica"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center mb-8">
                <p className="text-muted-foreground mb-3">Accedi per lasciare una recensione</p>
                <Button asChild variant="outline">
                  <Link to="/login">Accedi</Link>
                </Button>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nessuna recensione ancora. Sii il primo!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-2xl border border-border/60 bg-card p-5"
                  >
                    <header className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-medium">{r.author_name}</p>
                        <Stars value={r.rating} size={14} />
                      </div>
                      <time className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </header>
                    {r.title && <h3 className="font-medium mt-2">{r.title}</h3>}
                    {r.body && <p className="text-muted-foreground mt-1 leading-relaxed">{r.body}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
                <h2 className="font-display text-2xl font-semibold">
                  Altri prodotti di {product.seller?.business_name}
                </h2>
                {product.seller && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/store/${product.seller.slug}`}>Vedi tutti</Link>
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.slice(0, 4).map((p) => (
                  <ProductCardSmall key={p.id} p={p} onAdd={handleAddRelated} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
