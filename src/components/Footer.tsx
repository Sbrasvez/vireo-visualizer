import { Link } from "react-router-dom";
import { Leaf, Instagram, Twitter, Github, Mail } from "lucide-react";

const links = {
  Prodotto: [
    { label: "Ricette", href: "/recipes" },
    { label: "Ristoranti", href: "/restaurants" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "AI Assistant", href: "/recipes" },
  ],
  Risorse: [
    { label: "Blog", href: "/blog" },
    { label: "Guide", href: "/blog" },
    { label: "FAQ", href: "/blog" },
  ],
  Legale: [
    { label: "Privacy", href: "#" },
    { label: "Termini", href: "#" },
    { label: "Cookie", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40 pt-20 pb-10">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="size-10 rounded-xl gradient-leaf flex items-center justify-center shadow-soft">
                <Leaf className="size-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold">Vireo</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-2 italic font-medium">
              "Vivi green, semplicemente."
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              Smart Living, Green Future. La piattaforma digitale che integra tecnologia, sostenibilità e benessere.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Github, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="size-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  aria-label={`Social ${i}`}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="font-display font-semibold text-sm mb-4 uppercase tracking-wider">{group}</h4>
              <ul className="space-y-2.5">
                {items.map((l) => (
                  <li key={l.label}>
                    <Link to={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors story-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vireo. Tutti i diritti riservati.</p>
          <p className="font-medium">Made with 🌱 in Italy</p>
        </div>
      </div>
    </footer>
  );
}
