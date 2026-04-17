import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";

/**
 * Auto-generated breadcrumbs based on the current pathname.
 * Hidden on mobile (md:flex) and on the homepage.
 */
export default function Breadcrumbs() {
  const location = useLocation();
  const { t } = useTranslation();

  if (location.pathname === "/") return null;

  // Pages that use DashboardLayout already have their own sidebar header — skip breadcrumbs there.
  const SIDEBAR_ROUTES = ["/dashboard", "/ai", "/shopping-list", "/surplus", "/meal-plan", "/community"];
  if (SIDEBAR_ROUTES.some((r) => location.pathname === r || location.pathname.startsWith(`${r}/`))) {
    return null;
  }

  const segments = location.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  // Map known route slugs to friendly labels.
  const labelFor = (seg: string): string => {
    const map: Record<string, string> = {
      recipes: t("nav.recipes", "Ricette"),
      restaurants: t("nav.restaurants", "Ristoranti"),
      marketplace: t("nav.marketplace", "Marketplace"),
      surplus: "Anti-spreco",
      "meal-plan": "Meal Plan AI",
      community: "Community",
      ai: t("nav.ai_chat", "AI Chat"),
      blog: t("nav.blog", "Blog"),
      pricing: t("nav.pricing", "Prezzi"),
      dashboard: t("nav.dashboard", "Dashboard"),
      profile: t("nav.profile", "Profilo"),
      wishlist: t("nav.wishlist", "Wishlist"),
      "shopping-list": t("nav.shopping_list", "Lista spesa"),
      cart: t("nav.cart", "Carrello"),
      checkout: "Checkout",
      return: "Conferma",
      sell: "Vendi",
      apply: "Candidatura",
      seller: "Venditore",
      admin: "Admin",
      sellers: "Venditori",
      store: "Store",
      product: "Prodotto",
      login: t("nav.login", "Accedi"),
      signup: t("nav.signup", "Registrati"),
    };
    if (map[seg]) return map[seg];
    // Decode dynamic segments (slugs / ids): replace dashes, capitalize.
    try {
      const decoded = decodeURIComponent(seg);
      return decoded.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    } catch {
      return seg;
    }
  };

  // Build cumulative paths.
  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    return { href, label: labelFor(seg), isLast: idx === segments.length - 1 };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden md:flex sticky top-16 z-30 bg-background/70 backdrop-blur border-b border-border/40"
    >
      <ol className="container flex items-center gap-1.5 py-2 text-sm text-muted-foreground overflow-x-auto">
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label={t("nav.home", "Home")}
          >
            <Home className="size-3.5" />
          </Link>
        </li>
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
            {c.isLast ? (
              <span className="font-medium text-foreground truncate max-w-[40ch]" aria-current="page">
                {c.label}
              </span>
            ) : (
              <Link
                to={c.href}
                className="hover:text-foreground transition-colors truncate max-w-[24ch]"
              >
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
