import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Leaf,
  ChefHat,
  Utensils,
  ShoppingBag,
  BookOpen,
  LogOut,
  User,
  LayoutDashboard,
  Tag,
  PackageOpen,
  Heart,
  CalendarDays,
  Users,
  Sparkles,
  Store,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useHasRole } from "@/hooks/useUserRole";
import { useMySeller } from "@/hooks/useSeller";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type NavItem = { label: string; href: string; icon: typeof ChefHat };

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { count: cartCount } = useCart();
  const { uncheckedCount: shopCount } = useShoppingList();
  const { t } = useTranslation();
  const { has: isAdmin } = useHasRole("admin");
  const { data: mySeller } = useMySeller();

  const exploreLinks: NavItem[] = [
    { label: t("nav.recipes"), href: "/recipes", icon: ChefHat },
    { label: t("nav.restaurants"), href: "/restaurants", icon: Utensils },
    { label: "Anti-spreco", href: "/surplus", icon: PackageOpen },
    { label: t("nav.marketplace"), href: "/marketplace", icon: ShoppingBag },
    { label: "Meal Plan AI", href: "/meal-plan", icon: CalendarDays },
    { label: "Community", href: "/community", icon: Users },
    { label: t("nav.ai_chat"), href: "/ai", icon: Sparkles },
    { label: t("nav.blog"), href: "/blog", icon: BookOpen },
  ];

  const accountLinks: NavItem[] = user
    ? [
        { label: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { label: t("nav.wishlist", "Wishlist"), href: "/wishlist", icon: Heart },
        { label: t("nav.shopping_list", "Lista spesa"), href: "/shopping-list", icon: ShoppingCart },
        { label: t("nav.profile"), href: "/profile", icon: User },
        { label: t("nav.pricing"), href: "/pricing", icon: Tag },
        ...(mySeller
          ? [{ label: "Seller Dashboard", href: "/seller/dashboard", icon: Store }]
          : [{ label: "Diventa venditore", href: "/sell", icon: Store }]),
        ...(isAdmin ? [{ label: "Admin Sellers", href: "/admin/sellers", icon: ShieldCheck }] : []),
      ]
    : [{ label: t("nav.pricing"), href: "/pricing", icon: Tag }];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderItem = (l: NavItem) => (
    <Link
      key={l.href}
      to={l.href}
      onClick={() => setMenuOpen(false)}
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      <l.icon className="size-4" />
      {l.label}
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <nav className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="size-9 rounded-xl bg-primary flex items-center justify-center transition-transform hover:scale-105"
            aria-label={t("nav.menu")}
          >
            <Leaf className="size-5 text-primary-foreground" />
          </button>
          <Link to="/" className="font-display text-xl font-bold text-foreground hover:text-primary transition-colors">
            Vireo
          </Link>

          {menuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 max-h-[80vh] overflow-y-auto bg-background border border-border rounded-xl shadow-lg py-1 animate-fade-up z-50">
              <div className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("nav.explore")}
              </div>
              {exploreLinks.map(renderItem)}
              <div className="my-1 border-t border-border" />
              <div className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("nav.account")}
              </div>
              {accountLinks.map(renderItem)}
              {user && (
                <>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <LogOut className="size-4" />
                    {t("nav.logout")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {user && (
            <Button variant="ghost" size="sm" asChild className="relative hidden sm:inline-flex">
              <Link to="/shopping-list" aria-label={t("nav.shopping_list", "Lista spesa")}>
                <ShoppingCart className="size-4" />
                {shopCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-tertiary text-tertiary-foreground text-[10px] font-bold">
                    {shopCount}
                  </span>
                )}
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild className="relative">
            <Link to="/cart" aria-label={t("nav.cart", "Carrello")}>
              <ShoppingBag className="size-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/dashboard">
                  <LayoutDashboard className="size-4 mr-1" /> {t("nav.dashboard")}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/profile">
                  <User className="size-4 mr-1" /> <span className="hidden sm:inline">{t("nav.profile")}</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="hidden sm:inline-flex">
                <LogOut className="size-4 sm:mr-1" /> <span className="hidden sm:inline">{t("nav.logout")}</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">{t("nav.signup")}</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
