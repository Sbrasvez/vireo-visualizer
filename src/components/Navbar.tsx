import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Ricette", href: "/recipes" },
  { label: "Ristoranti", href: "/restaurants" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <nav className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
            <Leaf className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Vireo</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-accent transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Accedi</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Inizia gratis</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 animate-fade-up">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b border-border/50 last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to="/login">Accedi</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link to="/signup">Inizia gratis</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}