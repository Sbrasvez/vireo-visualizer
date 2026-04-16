import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Leaf, Flame, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RecipeRow } from "@/hooks/useRecipes";

interface Props {
  recipe: RecipeRow;
  index?: number;
}

export default function RecipeCard({ recipe, index = 0 }: Props) {
  const { t } = useTranslation();
  const cal = recipe.nutrition?.calories ? Math.round(recipe.nutrition.calories) : null;
  return (
    <Link
      to={`/recipes/${recipe.slug}`}
      className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover-lift animate-fade-up block"
      style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` }}
    >
      <article>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              width={636}
              height={478}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ChefHat className="size-12" />
            </div>
          )}
          {recipe.eco_score != null && (
            <div className="absolute top-3 right-3 bg-card/95 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-soft">
              <Leaf className="size-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">{Number(recipe.eco_score).toFixed(1)}</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge variant="secondary" className="backdrop-blur capitalize">{recipe.difficulty}</Badge>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {recipe.ready_in_minutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {recipe.ready_in_minutes} {t("recipes.min")}
              </span>
            )}
            {cal && (
              <span className="flex items-center gap-1.5">
                <Flame className="size-4" />
                {cal} kcal
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(recipe.diets || []).slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
