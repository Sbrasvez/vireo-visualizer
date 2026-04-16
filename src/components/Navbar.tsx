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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const navLinks = [
    { label: t("nav.recipes"), href: "/recipes", icon: ChefHat },
    { label: t("nav.restaurants"), href: "/restaurants", icon: Utensils },
    { label: t("nav.marketplace"), href: "/marketplace", icon: ShoppingBag },
    { label: t("nav.blog"), href: "/blog", icon: BookOpen },
    { label: t("nav.pricing"), href: "/pricing", icon: Tag },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <div className="absolute top-full left-0 mt-2 w-52 bg-background border border-border rounded-xl shadow-lg py-1 animate-fade-up z-50">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <l.icon className="size-4" />
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/dashboard">
                  <LayoutDashboard className="size-4 mr-1" /> {t("nav.dashboard")}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="size-4 mr-1" /> <span className="hidden sm:inline">{t("nav.profile")}</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
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
