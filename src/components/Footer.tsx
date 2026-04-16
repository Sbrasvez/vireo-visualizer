import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const links = {
  Prodotto: [
    { label: "Ricette", href: "/recipes" },
    { label: "Ristoranti", href: "/restaurants" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "AI Assistant", href: "/ai" },
  ],
  Risorse: [
    { label: "Blog", href: "/blog" },
    { label: "Guide", href: "/guidelines" },
    { label: "FAQ", href: "/faq" },
  ],
  Legale: [
    { label: "Privacy", href: "/privacy" },
    { label: "Termini", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-16">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="size-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Vireo</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smart Living, Green Future.<br />
              La piattaforma per uno stile di vita sostenibile.
            </p>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="font-semibold text-sm mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {items.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vireo. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  );
}