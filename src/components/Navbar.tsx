import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf, ChefHat, Utensils, ShoppingBag, BookOpen, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Ricette", href: "/recipes", icon: ChefHat },
  { label: "Ristoranti", href: "/restaurants", icon: Utensils },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Blog", href: "/blog", icon: BookOpen },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

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
            aria-label="Menu"
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

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="size-4 mr-1" /> Profilo
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="size-4 mr-1" /> Esci
              </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Accedi</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Inizia gratis</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
