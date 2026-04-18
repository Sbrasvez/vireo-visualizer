import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import CTAButton from "@/components/CTAButton";
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
import {
  useProductQuestions,
  useAskProductQuestion,
  useDeleteProductQuestion,
} from "@/hooks/useProductQuestions";
import { useCart } from "@/hooks/useCart";
import { WishlistButton } from "@/components/WishlistButton";
import { MessageCircleQuestion, Trash2 } from "lucide-react";
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

function StarPicker({ value, onChange, ariaLabel }: { value: number; onChange: (v: number) => void; ariaLabel: (n: number) => string }) {
  return (
    <div className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
          aria-label={ariaLabel(i)}
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

function ProductCardSmall({ p, onAdd, addLabel }: { p: SellerProduct; onAdd: (p: SellerProduct) => void; addLabel: string }) {
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
            <Plus className="size-4" /> {addLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function ProductDetail() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem } = useCart();

  const { data: product, isLoading } = useProductDetail(slug);
  const { data: reviews = [] } = useProductReviews(product?.id);
  const { data: myReview } = useMyProductReview(product?.id);
  const { data: related = [] } = useRelatedProducts(product?.seller_id, product?.id);
  const { data: questions = [] } = useProductQuestions(product?.id);
  const upsertReview = useUpsertProductReview(product?.id);
  const deleteReview = useDeleteProductReview(product?.id);
  const askQuestion = useAskProductQuestion(product?.id);
  const deleteQuestion = useDeleteProductQuestion(product?.id);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const [rating, setRating] = useState(myReview?.rating ?? 5);
  const [title, setTitle] = useState(myReview?.title ?? "");
  const [body, setBody] = useState(myReview?.body ?? "");
  const [questionText, setQuestionText] = useState("");

  const dateFmt = (iso: string, withYear = true) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24">
          <SkeletonProductDetail />
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
          <h1 className="font-display text-3xl">{t("product_detail.not_found")}</h1>
          <p className="text-muted-foreground">{t("product_detail.not_found_desc")}</p>
          <Button asChild>
            <Link to="/marketplace">
              <ArrowLeft className="size-4 mr-2" /> {t("product_detail.back_to_marketplace")}
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
    toast({ title: t("product_detail.added_toast"), description: product.name });
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
    toast({ title: t("product_detail.added_toast"), description: p.name });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: t("reviews.login_required"), description: t("reviews.login_required_desc") });
      return;
    }
    upsertReview.mutate({
      rating,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
      author_name:
        (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "Customer",
    });
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: t("qa.login_required"), description: t("qa.login_required_desc") });
      return;
    }
    if (questionText.trim().length < 3) return;
    askQuestion.mutate(
      {
        question: questionText,
        author_name:
          (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "Customer",
      },
      { onSuccess: () => setQuestionText("") },
    );
  };

  const sellerName = product.seller?.business_name ?? t("qa.the_seller");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-6xl">
          <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 -ml-3">
            <Link to="/marketplace">
              <ArrowLeft className="size-4" /> {t("product_detail.back")}
            </Link>
          </Button>

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14">
            {/* Gallery — editorial */}
            <div className="space-y-4">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted border border-border/40 shadow-soft">
                {current ? (
                  <img
                    src={current}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground">
                    <ShoppingBag className="size-16" />
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground font-mono text-[10px] tracking-wider uppercase">
                    -{discount}%
                  </Badge>
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {product.is_reused && (
                    <Badge className="bg-tertiary text-tertiary-foreground gap-1 font-mono text-[10px] tracking-wider uppercase">
                      <Recycle className="size-3" /> {t("marketplace.reuse_badge")}
                    </Badge>
                  )}
                  {product.is_bio && (
                    <Badge className="bg-primary text-primary-foreground gap-1 font-mono text-[10px] tracking-wider uppercase">
                      <Leaf className="size-3" /> {t("seller_dashboard.bio")}
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
                        "aspect-square rounded-lg overflow-hidden transition-all",
                        activeImage === i
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "opacity-60 hover:opacity-100",
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info — editorial */}
            <div className="space-y-6 lg:pt-2">
              {product.seller && (
                <Link
                  to={`/store/${product.seller.slug}`}
                  className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                >
                  <Avatar className="size-5">
                    <AvatarImage src={product.seller.logo_url ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {product.seller.business_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {t("product_detail.sold_by")} —{" "}
                    <span className="font-semibold text-foreground tracking-normal normal-case">{product.seller.business_name}</span>
                  </span>
                </Link>
              )}

              <div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight mb-4 text-balance">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 text-sm">
                  <Stars value={Number(product.rating ?? 0)} />
                  <span className="text-muted-foreground font-mono text-xs">
                    {Number(product.rating ?? 0).toFixed(1)} ·{" "}
                    {t("product_detail.reviews_count", { count: product.reviews_count })}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-3 pt-2 pb-2 border-y border-border/50 py-5">
                <span className="font-display text-5xl font-light tracking-tight">{formatEur(product.price_cents)}</span>
                {product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents && (
                  <span className="text-lg text-muted-foreground line-through mb-1.5">
                    {formatEur(product.compare_at_price_cents)}
                  </span>
                )}
              </div>

              {product.short_description && (
                <p className="text-base text-muted-foreground leading-relaxed font-display italic">
                  {product.short_description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="size-3.5" />
                  {product.shipping_cents === 0
                    ? t("product_detail.free_shipping")
                    : t("product_detail.shipping", { price: formatEur(product.shipping_cents) })}
                </span>
                <span>·</span>
                <span className={cn(inStock ? "text-primary" : "text-destructive")}>
                  {inStock
                    ? product.unlimited_stock
                      ? t("product_detail.available")
                      : t("product_detail.available_count", { count: product.stock })
                    : t("product_detail.out_of_stock")}
                </span>
              </div>

              {/* Quantity + Add */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="inline-flex items-center rounded-full border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="size-11 grid place-items-center text-muted-foreground hover:text-foreground transition"
                    aria-label={t("product_detail.decrease")}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-10 text-center font-medium font-display">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    className="size-11 grid place-items-center text-muted-foreground hover:text-foreground transition"
                    aria-label={t("product_detail.increase")}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <CTAButton
                  size="lg"
                  onClick={() => handleAdd()}
                  disabled={!inStock}
                  className="flex-1 sm:flex-none min-w-48"
                >
                  {justAdded ? (
                    <>
                      <Check className="size-5" /> {t("product_detail.added")}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="size-5" /> {t("product_detail.add_to_cart")}
                    </>
                  )}
                </CTAButton>
                <WishlistButton productId={product.id} variant="full" />
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal font-mono text-[10px] uppercase tracking-wider">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <section className="mt-20 max-w-3xl">
              <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
                — {t("product_detail.description_eyebrow", "Dettagli")}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight mb-6">
                {t("product_detail.description")}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
                {product.description}
              </p>
            </section>
          )}

          {/* Reviews */}
          <section className="mt-20">
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-border/60 flex-wrap gap-3">
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
                  — {t("product_detail.reviews_eyebrow", "Voci dei clienti")}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight">{t("reviews.title")}</h2>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Stars value={Number(product.rating ?? 0)} />
                  <span className="font-mono text-xs">
                    {t("product_detail.rating_summary", {
                      rating: Number(product.rating ?? 0).toFixed(1),
                      count: product.reviews_count,
                    })}
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
                  <Label className="mb-2 block">{t("reviews.your_rating")}</Label>
                  <StarPicker value={rating} onChange={setRating} ariaLabel={(n) => t("product_detail.rating_stars", { count: n })} />
                </div>
                <div>
                  <Label htmlFor="review-title" className="mb-2 block">
                    {t("reviews.title_label")}
                  </Label>
                  <Input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("reviews.title_placeholder")}
                    maxLength={120}
                  />
                </div>
                <div>
                  <Label htmlFor="review-body" className="mb-2 block">
                    {t("reviews.body_label")}
                  </Label>
                  <Textarea
                    id="review-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={t("reviews.body_placeholder")}
                    rows={4}
                    maxLength={2000}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {myReview ? t("reviews.updating_existing") : t("reviews.publish_yours")}
                  </p>
                  <div className="flex gap-2">
                    {myReview && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => deleteReview.mutate()}
                        disabled={deleteReview.isPending}
                      >
                        {t("reviews.delete")}
                      </Button>
                    )}
                    <Button type="submit" disabled={upsertReview.isPending}>
                      {upsertReview.isPending
                        ? t("reviews.sending")
                        : myReview
                          ? t("reviews.update")
                          : t("reviews.publish")}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center mb-8">
                <p className="text-muted-foreground mb-3">{t("reviews.login_to_review")}</p>
                <Button asChild variant="outline">
                  <Link to="/login">{t("reviews.login")}</Link>
                </Button>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t("reviews.empty")}</p>
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
                      <time className="text-xs text-muted-foreground">{dateFmt(r.created_at)}</time>
                    </header>
                    {r.title && <h3 className="font-medium mt-2">{r.title}</h3>}
                    {r.body && <p className="text-muted-foreground mt-1 leading-relaxed">{r.body}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Q&A */}
          <section className="mt-20">
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-border/60 flex-wrap gap-3">
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3 inline-flex items-center gap-2">
                  <MessageCircleQuestion className="size-3.5" />
                  — {t("product_detail.qa_eyebrow", "Domande")}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight">
                  {t("qa.title")}
                </h2>
                <p className="text-sm text-muted-foreground mt-3 font-mono">
                  {t("qa.subtitle_other", {
                    count: questions.length,
                    brand: sellerName,
                    defaultValue_one: t("qa.subtitle_one", {
                      count: questions.length,
                      brand: sellerName,
                    }),
                  })}
                </p>
              </div>
            </div>

            {user ? (
              <form
                onSubmit={handleAskQuestion}
                className="rounded-2xl border border-border/60 bg-card p-6 space-y-3 mb-8"
              >
                <Label htmlFor="question-text" className="block">
                  {t("qa.ask_label")}
                </Label>
                <Textarea
                  id="question-text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={t("qa.ask_placeholder")}
                  rows={3}
                  maxLength={1000}
                  required
                  minLength={3}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{questionText.length}/1000</span>
                  <Button
                    type="submit"
                    disabled={askQuestion.isPending || questionText.trim().length < 3}
                  >
                    {askQuestion.isPending ? t("qa.sending") : t("qa.publish_question")}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center mb-8">
                <p className="text-muted-foreground mb-3">{t("qa.login_to_ask")}</p>
                <Button asChild variant="outline">
                  <Link to="/login">{t("qa.login")}</Link>
                </Button>
              </div>
            )}

            {questions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t("qa.empty")}</p>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <article
                    key={q.id}
                    className="rounded-2xl border border-border/60 bg-card p-5 space-y-3"
                  >
                    <header className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{q.author_name}</span>{" "}
                          {t("qa.asked")} · {dateFmt(q.created_at)}
                        </p>
                        <p className="mt-1 leading-relaxed">{q.question}</p>
                      </div>
                      {user?.id === q.user_id && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuestion.mutate(q.id)}
                          disabled={deleteQuestion.isPending}
                          aria-label={t("qa.delete")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </header>

                    {q.answer ? (
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                        <p className="text-xs font-medium text-primary mb-1">
                          {t("qa.answer_by", { brand: sellerName })}
                          {q.answered_at && (
                            <span className="text-muted-foreground font-normal">
                              {" "}· {dateFmt(q.answered_at, false)}
                            </span>
                          )}
                        </p>
                        <p className="leading-relaxed whitespace-pre-line">{q.answer}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        {t("qa.awaiting_answer")}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-20">
              <div className="flex items-end justify-between mb-8 pb-6 border-b border-border/60 flex-wrap gap-3">
                <div>
                  <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
                    — {t("product_detail.related_eyebrow", "Dallo stesso atelier")}
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight">
                    {t("product_detail.related", { brand: product.seller?.business_name ?? "" })}
                  </h2>
                </div>
                {product.seller && (
                  <Button asChild variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-wider">
                    <Link to={`/store/${product.seller.slug}`}>{t("product_detail.see_all")}</Link>
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.slice(0, 4).map((p) => (
                  <ProductCardSmall
                    key={p.id}
                    p={p}
                    onAdd={handleAddRelated}
                    addLabel={t("product_detail.add")}
                  />
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
