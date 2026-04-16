import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  read_time: string;
}

const PLACEHOLDER_POSTS: BlogPost[] = [
  { id: 1, title: "5 Modi per Ridurre lo Spreco Alimentare", excerpt: "Strategie pratiche per diminuire gli sprechi in cucina e risparmiare, dall'organizzazione del frigo alla spesa consapevole.", category: "Zero Waste", date: "12 Apr 2026", read_time: "5 min" },
  { id: 2, title: "La Rivoluzione del Packaging Compostabile", excerpt: "Come le nuove tecnologie stanno trasformando il confezionamento alimentare verso soluzioni 100% compostabili.", category: "Innovazione", date: "8 Apr 2026", read_time: "7 min" },
  { id: 3, title: "Guida alla Spesa Stagionale di Primavera", excerpt: "Frutta e verdura di stagione ad aprile: cosa comprare per mangiare bene, spendere meno e rispettare l'ambiente.", category: "Stagionalità", date: "3 Apr 2026", read_time: "4 min" },
  { id: 4, title: "Intervista: Chef Marco e la Cucina Rigenerativa", excerpt: "Abbiamo parlato con Chef Marco del suo approccio alla cucina rigenerativa e del legame tra cibo e territorio.", category: "Interviste", date: "28 Mar 2026", read_time: "8 min" },
  { id: 5, title: "Come Leggere le Etichette Bio", excerpt: "Guida completa ai marchi di certificazione biologica in Italia e in Europa: cosa significano davvero.", category: "Guide", date: "22 Mar 2026", read_time: "6 min" },
  { id: 6, title: "Urban Farming: Coltivare in Città", excerpt: "Dal balcone all'orto condiviso: come produrre cibo fresco anche in contesti urbani.", category: "Lifestyle", date: "15 Mar 2026", read_time: "5 min" },
];

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setPosts(data))
      .catch(() => setPosts(PLACEHOLDER_POSTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-0">
              <BookOpen className="size-3 mr-1" /> Vireo Blog
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Approfondimenti, guide e storie sul vivere sostenibile. Ispirati ogni giorno.
            </p>
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Cerca articoli..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3" /> {post.date}
                      </span>
                      <span className="text-xs text-muted-foreground">· {post.read_time}</span>
                    </div>
                    <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary gap-1">
                      Leggi articolo <ArrowRight className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nessun articolo trovato.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
