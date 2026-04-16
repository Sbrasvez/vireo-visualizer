import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Leaf, Instagram, Twitter, Github, Mail } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  const groups = [
    {
      title: t("footer.product"),
      items: [
        { label: t("nav.recipes"), href: "/recipes" },
        { label: t("nav.restaurants"), href: "/restaurants" },
        { label: t("nav.marketplace"), href: "/marketplace" },
        { label: "AI Assistant", href: "/recipes" },
      ],
    },
    {
      title: t("footer.resources"),
      items: [
        { label: t("nav.blog"), href: "/blog" },
        { label: "Guide", href: "/blog" },
        { label: "FAQ", href: "/blog" },
      ],
    },
    {
      title: t("footer.legal"),
      items: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Cookie", href: "#" },
      ],
    },
  ];

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
              {t("footer.tagline")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              {t("footer.description")}
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

          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="font-display font-semibold text-sm mb-4 uppercase tracking-wider">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.items.map((l) => (
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
          <p>© {new Date().getFullYear()} Vireo. {t("footer.rights")}</p>
          <p className="font-medium">{t("footer.made")}</p>
        </div>
      </div>
    </footer>
  );
}
