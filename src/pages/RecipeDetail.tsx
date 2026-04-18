import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock, Users, Flame, Leaf, ChefHat, Minus, Plus, ExternalLink, Bookmark, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecipeBySlug } from "@/hooks/useRecipes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useShoppingList } from "@/hooks/useShoppingList";
import { toast } from "sonner";

function fmtAmount(n: number): string {
  if (!isFinite(n)) return "";
  const rounded = Math.round(n * 100) / 100;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, "");
}

export default function RecipeDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: recipe, isLoading } = useRecipeBySlug(slug);
  const { user } = useAuth();
  const { addItems } = useShoppingList();
  const [servings, setServings] = useState<number | null>(null);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());

  const baseServings = recipe?.servings || 2;
  const currentServings = servings ?? baseServings;
  const factor = currentServings / baseServings;

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map((ing) => ({
      ...ing,
      scaledAmount: ing.amount ? ing.amount * factor : ing.amount,
    }));
  }, [recipe, factor]);

  const handleSave = async () => {
    if (!user) {
      toast.error(t("recipes.save_login_required"));
      return;
    }
    if (!recipe) return;
    const { error } = await supabase.from("saved_recipes").insert({
      user_id: user.id,
      external_id: recipe.external_id || recipe.id,
      source: recipe.source ?? "spoonacular",
      title: recipe.title,
      image_url: recipe.image,
      ready_in_minutes: recipe.ready_in_minutes,
      diets: recipe.diets,
    } as never);
    if (error) toast.error(t("recipes.save_error"));
    else toast.success(t("recipes.save_success"));
  };

  const handleAddToShoppingList = () => {
    if (!recipe) return;
    addItems(
      scaledIngredients.map((ing) => ({
        name: ing.name,
        amount: ing.scaledAmount,
        unit: ing.unit,
        category: "",
        recipeId: recipe.id,
        recipeTitle: recipe.title,
      })),
    );
    toast.success(t("recipes.added_to_shopping_list", { count: scaledIngredients.length }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 container">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="aspect-[16/7] w-full rounded-2xl mb-8" />
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 lg:col-span-1" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 container py-20 text-center">
          <ChefHat className="size-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold mb-3">{t("recipes.not_found_title")}</h1>
          <p className="text-muted-foreground mb-6">{t("recipes.not_found_desc")}</p>
          <Button asChild><Link to="/recipes">{t("recipes.back")}</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const cal = recipe.nutrition?.calories ? Math.round(recipe.nutrition.calories * factor) : null;
  const protein = recipe.nutrition?.protein ? Math.round(recipe.nutrition.protein * factor) : null;
  const carbs = recipe.nutrition?.carbs ? Math.round(recipe.nutrition.carbs * factor) : null;
  const fat = recipe.nutrition?.fat ? Math.round(recipe.nutrition.fat * factor) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        <div className="container">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
            <Link to="/recipes"><ArrowLeft className="size-4 mr-2" />{t("recipes.back")}</Link>
          </Button>

          {/* Editorial header */}
          <header className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 mb-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">N°{(recipe.id?.slice(0, 3) ?? "001").toUpperCase()}</span>
                <span className="h-px flex-1 max-w-[60px] bg-border" />
                <span className="font-mono text-xs tracking-[0.2em] text-primary uppercase">{t("recipes.recipe_label", "Ricetta")}</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight mb-6 text-balance">
                {recipe.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.eco_score != null && (
                  <Badge className="bg-primary/10 text-primary border-0 font-mono text-[10px] tracking-wider uppercase">
                    <Leaf className="size-3 mr-1" />
                    Eco {Number(recipe.eco_score).toFixed(1)}
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize font-mono text-[10px] tracking-wider">{recipe.difficulty}</Badge>
                {recipe.diets.slice(0, 3).map((d) => (
                  <Badge key={d} variant="outline" className="capitalize font-mono text-[10px] tracking-wider">{d}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground border-y border-border/50 py-4">
                {recipe.ready_in_minutes && (
                  <span className="flex items-center gap-2"><Clock className="size-4 text-primary" /><strong className="text-foreground font-display text-lg font-normal">{recipe.ready_in_minutes}</strong> {t("recipes.min")}</span>
                )}
                <span className="flex items-center gap-2"><Users className="size-4 text-primary" /><strong className="text-foreground font-display text-lg font-normal">{currentServings}</strong> {t("recipes.servings")}</span>
                {cal && <span className="flex items-center gap-2"><Flame className="size-4 text-primary" /><strong className="text-foreground font-display text-lg font-normal">{cal}</strong> kcal</span>}
              </div>
              <div className="flex gap-2 flex-wrap mt-6">
                <Button variant="default" size="sm" onClick={handleAddToShoppingList} className="rounded-full">
                  <ShoppingCart className="size-4 mr-2" />{t("recipes.add_to_shopping_list")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave} className="rounded-full">
                  <Bookmark className="size-4 mr-2" />{t("recipes.save")}
                </Button>
                {recipe.source_url && (
                  <Button asChild variant="ghost" size="sm" className="rounded-full">
                    <a href={recipe.source_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4 mr-2" />{t("recipes.source")}
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="order-1 lg:order-2 relative aspect-[4/5] lg:aspect-[5/6] rounded-2xl overflow-hidden bg-muted border border-border/40 shadow-soft">
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ChefHat className="size-20 text-muted-foreground" />
                </div>
              )}
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-8 pb-16">
            <aside className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display text-xl font-bold">{t("recipes.ingredients")}</h2>
                    <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                      <Button
                        variant="ghost" size="icon" className="size-7 rounded-full"
                        onClick={() => setServings(Math.max(1, currentServings - 1))}
                        aria-label={t("recipes.decrease_servings")}
                      ><Minus className="size-3.5" /></Button>
                      <span className="text-sm font-semibold w-8 text-center">{currentServings}</span>
                      <Button
                        variant="ghost" size="icon" className="size-7 rounded-full"
                        onClick={() => setServings(currentServings + 1)}
                        aria-label={t("recipes.increase_servings")}
                      ><Plus className="size-3.5" /></Button>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {scaledIngredients.map((ing, i) => (
                      <li key={`${ing.name}-${i}`} className="flex items-start gap-3 text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0">
                        {ing.image && (
                          <img src={ing.image} alt="" className="size-10 rounded-lg object-cover bg-muted shrink-0" loading="lazy" />
                        )}
                        <div className="flex-1">
                          <span className="font-semibold text-primary">
                            {ing.scaledAmount ? fmtAmount(ing.scaledAmount) : ""} {ing.unit}
                          </span>{" "}
                          <span className="capitalize">{ing.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {recipe.nutrition && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-bold mb-4">{t("recipes.nutrition_title")}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {cal != null && <NutriBox label={t("recipes.nutri_calories")} value={`${cal} kcal`} />}
                      {protein != null && <NutriBox label={t("recipes.nutri_protein")} value={`${protein} g`} />}
                      {carbs != null && <NutriBox label={t("recipes.nutri_carbs")} value={`${carbs} g`} />}
                      {fat != null && <NutriBox label={t("recipes.nutri_fat")} value={`${fat} g`} />}
                    </div>
                  </CardContent>
                </Card>
              )}
            </aside>

            <section className="lg:col-span-2 space-y-6">
              {recipe.summary && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-display text-xl font-bold mb-3">{t("recipes.description")}</h2>
                    <p className="text-muted-foreground leading-relaxed">{recipe.summary}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-2xl font-bold mb-6">{t("recipes.instructions")}</h2>
                  {recipe.instructions.length === 0 ? (
                    <p className="text-muted-foreground">{t("recipes.no_instructions")}</p>
                  ) : (
                    <ol className="space-y-5">
                      {recipe.instructions.map((s) => {
                        const done = doneSteps.has(s.number);
                        return (
                          <li
                            key={s.number}
                            className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                              done ? "bg-accent border-primary/30" : "bg-card border-border/60 hover:border-primary/40"
                            }`}
                            onClick={() => {
                              setDoneSteps((prev) => {
                                const next = new Set(prev);
                                if (next.has(s.number)) next.delete(s.number);
                                else next.add(s.number);
                                return next;
                              });
                            }}
                          >
                            <div className={`size-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${
                              done ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                            }`}>
                              {s.number}
                            </div>
                            <p className={`text-base leading-relaxed pt-1 ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {s.step}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function NutriBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-accent/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display font-bold text-lg text-primary">{value}</div>
    </div>
  );
}
