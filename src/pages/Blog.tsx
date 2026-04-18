import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MotionCard from "@/components/MotionCard";
import b1 from "@/assets/blog-1.jpg";
import b2 from "@/assets/blog-2.jpg";
import b3 from "@/assets/blog-3.jpg";

const featured = {
  title: "Come ridurre l'impatto ambientale partendo dalla cucina",
  excerpt: "Una guida pratica con 12 abitudini quotidiane che, sommate, possono dimezzare l'impronta di carbonio della tua famiglia.",
  img: b1,
  date: "12 Apr 2026",
  read: "8 min",
  category: "Sostenibilità",
};

const articles = [
  { id: 1, title: "Zero waste in cucina: 7 strumenti essenziali", img: b2, date: "8 Apr 2026", read: "5 min", category: "Lifestyle" },
  { id: 2, title: "La spesa a km 0: dove trovarla nella tua città", img: b3, date: "5 Apr 2026", read: "6 min", category: "Spesa" },
  { id: 3, title: "Proteine vegetali: le migliori fonti per atleti", img: b1, date: "1 Apr 2026", read: "7 min", category: "Nutrizione" },
  { id: 4, title: "Compostaggio domestico: la guida definitiva", img: b2, date: "28 Mar 2026", read: "10 min", category: "Casa green" },
  { id: 5, title: "Cosmetici naturali: leggere l'INCI senza errori", img: b3, date: "24 Mar 2026", read: "6 min", category: "Beauty" },
  { id: 6, title: "Mobilità sostenibile: la rivoluzione delle e-bike", img: b1, date: "20 Mar 2026", read: "8 min", category: "Mobilità" },
];

export default function Blog() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-16 gradient-soft overflow-hidden">
          <div className="absolute top-10 left-10 size-72 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="container relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-up">
                <BookOpen className="size-4" />
                <span>{t("blog.badge")}</span>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold mb-5 text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
                {t("blog.title_1")} <span className="italic text-gradient-leaf">{t("blog.title_2")}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
                {t("blog.subtitle")}
              </p>

              <div className="flex gap-3 max-w-md animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <Input placeholder={t("blog.newsletter_placeholder")} className="h-12 rounded-xl bg-card" />
                <Button className="h-12 px-6 rounded-xl shadow-elegant">{t("blog.subscribe")}</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <article className="grid lg:grid-cols-2 gap-10 items-center bg-card rounded-3xl border border-border/60 overflow-hidden hover-lift">
              <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden">
                <img src={featured.img} alt={featured.title} loading="lazy" className="w-full h-full object-cover" width={1024} height={768} />
              </div>
              <div className="p-8 lg:p-12">
                <Badge className="mb-4 bg-secondary text-secondary-foreground">{t("blog.featured_label")} · {featured.category}</Badge>
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-balance leading-tight">{featured.title}</h2>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {featured.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="size-4" /> {featured.read}</span>
                </div>
                <Button className="rounded-xl gap-2 group">
                  {t("blog.read_article")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </article>
          </div>
        </section>

        <section className="pb-20">
          <div className="container">
            <h2 className="font-display text-3xl font-bold mb-10">{t("blog.all_articles")}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a, i) => (
                <article key={a.id} className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover-lift animate-fade-up cursor-pointer" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={a.img} alt={a.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" width={1024} height={640} />
                    <Badge className="absolute top-3 left-3 bg-card/95 backdrop-blur text-foreground">{a.category}</Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="size-3.5" /> {a.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="size-3.5" /> {a.read}</span>
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
