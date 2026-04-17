import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Wallet, ShieldCheck, Sparkles, Leaf, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMySeller } from "@/hooks/useSeller";

export default function Sell() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: mySeller } = useMySeller();

  const ctaTo = !user
    ? "/login?redirect=/sell/apply"
    : mySeller
      ? "/seller/dashboard"
      : "/sell/apply";
  const ctaLabel = !user
    ? t("sell.cta_login")
    : mySeller
      ? mySeller.status === "approved"
        ? t("sell.cta_dashboard")
        : mySeller.status === "pending"
          ? t("sell.cta_pending")
          : t("sell.cta_retry")
      : t("sell.cta_apply");

  const features = [
    { icon: Wallet, t: t("sell.feat_commission_t"), d: t("sell.feat_commission_d") },
    { icon: Sparkles, t: t("sell.feat_visibility_t"), d: t("sell.feat_visibility_d") },
    { icon: ShieldCheck, t: t("sell.feat_payments_t"), d: t("sell.feat_payments_d") },
    { icon: Leaf, t: t("sell.feat_green_t"), d: t("sell.feat_green_d") },
    { icon: Store, t: t("sell.feat_store_t"), d: t("sell.feat_store_d") },
    { icon: ArrowRight, t: t("sell.feat_onboard_t"), d: t("sell.feat_onboard_d") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-20 gradient-soft overflow-hidden">
          <div className="absolute top-10 right-10 size-96 rounded-full bg-primary/15 blur-3xl animate-float" />
          <div className="container relative">
            <div className="max-w-3xl">
              <Badge className="mb-6 px-4 py-1.5 bg-accent text-accent-foreground gap-2">
                <Store className="size-4" /> {t("sell.badge")}
              </Badge>
              <h1 className="font-display text-5xl sm:text-6xl font-bold mb-5 text-balance">
                {t("sell.title_1")} <span className="italic text-gradient-leaf">{t("sell.title_2")}</span> {t("sell.title_3")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                {t("sell.subtitle")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild className="h-14 px-8 rounded-xl shadow-elegant">
                  <Link to={ctaTo}>
                    {ctaLabel} <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-14 px-8 rounded-xl">
                  <Link to="/marketplace">{t("sell.explore_marketplace")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <article
                  key={i}
                  className="rounded-2xl border border-border/60 bg-card p-6 hover-lift animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="size-12 rounded-xl bg-primary/10 grid place-items-center mb-4">
                    <f.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">{f.t}</h3>
                  <p className="text-sm text-muted-foreground">{f.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-accent/30">
          <div className="container text-center max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              {t("sell.cta_section_title")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("sell.cta_section_desc")}
            </p>
            <Button size="lg" asChild className="h-14 px-8 rounded-xl shadow-elegant">
              <Link to={ctaTo}>{ctaLabel}</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
