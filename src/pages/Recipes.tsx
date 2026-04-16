import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, ChefHat, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import RecipeCard from "@/components/RecipeCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useDebounce } from "@/hooks/useDebounce";
import { useRecipes } from "@/hooks/useRecipes";

const DIETS = [
  { value: "all", label: "Tutte le diete" },
  { value: "vegan", label: "Vegana" },
  { value: "vegetarian", label: "Vegetariana" },
  { value: "gluten free", label: "Senza glutine" },
  { value: "dairy free", label: "Senza lattosio" },
  { value: "ketogenic", label: "Chetogenica" },
];

const DIFFICULTIES = [
  { value: "all", label: "Qualsiasi difficoltà" },
  { value: "facile", label: "Facile" },
  { value: "media", label: "Media" },
  { value: "difficile", label: "Difficile" },
];

export default function Recipes() {
  const [searchInput, setSearchInput] = useState("");
  const [diet, setDiet] = useState("all");
  const [difficulty, setDifficulty] = useState<"all" | "facile" | "media" | "difficile">("all");
  const [maxTime, setMaxTime] = useState<number>(120);
  const [page, setPage] = useState(1);
  const search = useDebounce(searchInput, 350);

  const { data, isLoading } = useRecipes({
    search,
    diet,
    difficulty,
    maxTime,
    page,
    pageSize: 24,
  });

  // Reset to page 1 on filter change
  const filterKey = `${search}|${diet}|${difficulty}|${maxTime}`;
  useMemo(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const totalPages = data?.totalPages ?? 1;
  const pages = buildPagination(page, totalPages);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-16 gradient-soft overflow-hidden">
          <div className="absolute top-10 right-10 size-72 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="container relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-up">
                <ChefHat className="size-4" />
                <span>Database Spoonacular + AI Vireo</span>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-bold mb-5 text-balance animate-fade-up" style={{ animationDelay: "0.1s" }}>
                Ricette <span className="italic text-gradient-leaf">vegane</span> e bio
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
                Migliaia di ricette filtrabili per dieta, ingredienti, tempo di preparazione e difficoltà.
                Scegli, scala le porzioni e cucina con istruzioni step-by-step.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Cerca una ricetta o un ingrediente..."
                    className="pl-12 h-14 rounded-xl text-base border-border bg-card"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container">
            {/* Filters */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 mb-8 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="size-4 text-primary" />
                <h2 className="font-display text-lg font-semibold">Filtri</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">Dieta</label>
                  <Select value={diet} onValueChange={setDiet}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DIETS.map((d) => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">Difficoltà</label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((d) => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">Tempo massimo</label>
                    <span className="text-sm font-semibold text-primary">{maxTime} min</span>
                  </div>
                  <Slider value={[maxTime]} min={10} max={120} step={5} onValueChange={(v) => setMaxTime(v[0])} />
                </div>
              </div>
            </div>

            {/* Header count */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold">Ricette in evidenza</h2>
                <p className="text-muted-foreground mt-1">
                  {isLoading ? "Caricamento…" : `${data?.total ?? 0} ricette trovate`}
                </p>
              </div>
              {(diet !== "all" || difficulty !== "all" || maxTime < 120 || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearchInput(""); setDiet("all"); setDifficulty("all"); setMaxTime(120); }}
                >
                  Azzera filtri
                </Button>
              )}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : !data?.recipes.length ? (
              <div className="text-center py-20">
                <ChefHat className="size-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-2xl font-semibold mb-2">Nessuna ricetta trovata</h3>
                <p className="text-muted-foreground">Prova ad allargare i filtri o a cambiare la ricerca.</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {data.recipes.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} />)}
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-12">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); if (page > 1) { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                          className={page === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {pages.map((p, i) =>
                        p === "..." ? (
                          <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              isActive={p === page}
                              onClick={(e) => { e.preventDefault(); setPage(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); if (page < totalPages) { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                          className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function buildPagination(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
