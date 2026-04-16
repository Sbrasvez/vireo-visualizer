import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Star, Heart, Recycle, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

const products = [
  { id: 1, name: "Set utensili in bambù", img: p1, price: 18.9, oldPrice: 24.9, seller: "EcoCasa", rating: 4.8, reviews: 142, badge: "Nuovo", reused: false },
  { id: 2, name: "Barattoli vetro riciclato (set 6)", img: p2, price: 22.5, seller: "ZeroWaste Co.", rating: 4.9, reviews: 287, badge: "Best seller", reused: false },
  { id: 3, name: "Tote bag cotone organico", img: p3, price: 12.0, seller: "Tessuti Etici", rating: 4.7, reviews: 98, reused: false },
  { id: 4, name: "Beeswax wraps (set 3)", img: p4, price: 15.5, seller: "BeeFriendly", rating: 4.8, reviews: 213, badge: "Bio", reused: false },
  { id: 5, name: "Set utensili (riuso)", img: p1, price: 9.9, oldPrice: 18.9, seller: "Vireo Reuse", rating: 4.6, reviews: 54, reused: true },
  { id: 6, name: "Barattoli vintage (riuso)", img: p2, price: 11.0, seller: "Vireo Reuse", rating: 4.5, reviews: 32, reused: true },
];

export default function Marketplace() {
  const { t } = useTranslation();
  const categories = [
    t("marketplace.categories.all"),
    t("marketplace.categories.kitchen"),
    t("marketplace.categories.home"),
    t("marketplace.categories.personal"),
    t("marketplace.categories.reuse"),
    t("marketplace.categories.bio"),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
              {products.map((p, i) => (
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
                        <div className="font-display text-xl font-bold text-foreground">€{p.price.toFixed(2)}</div>
                        {p.oldPrice && <div className="text-xs text-muted-foreground line-through">€{p.oldPrice.toFixed(2)}</div>}
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <ShoppingBag className="size-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
