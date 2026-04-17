import { Link } from "react-router-dom";
import { Clock, Leaf, ChefHat } from "lucide-react";
import { useTranslation } from "react-i18next";

export type RecipeCardData = {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  minutes: number | null;
  diets: string[];
  difficulty: string | null;
  eco_score?: number | null;
  summary?: string | null;
};

export function ChatRecipeCards({ data }: { data: RecipeCardData[] }) {
  const { t } = useTranslation();
  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic py-2">
        {t("ai.no_recipes_found", "Nessuna ricetta trovata.")}
      </div>
    );
  }

  return (
    <div className="not-prose space-y-2.5 my-2">
      {data.map((r) => (
        <Link
          key={r.id}
          to={`/recipes/${r.slug}`}
          className="block bg-background rounded-2xl border border-border overflow-hidden hover:border-primary/60 hover:shadow-md transition-all group"
        >
          {r.image && (
            <div className="relative w-full h-32 overflow-hidden bg-muted">
              <img
                src={r.image}
                alt={r.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {r.eco_score && r.eco_score >= 7 && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-primary/90 text-primary-foreground rounded-full font-semibold backdrop-blur">
                  <Leaf className="size-3" />
                  Eco {r.eco_score}
                </span>
              )}
            </div>
          )}
          <div className="p-3">
            <div className="font-display font-semibold text-foreground text-sm leading-tight line-clamp-2">
              {r.title}
            </div>
            {r.summary && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.summary}</p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {r.minutes && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                  <Clock className="size-2.5" />
                  {r.minutes} min
                </span>
              )}
              {r.difficulty && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full capitalize">
                  <ChefHat className="size-2.5" />
                  {r.difficulty}
                </span>
              )}
              {r.diets?.slice(0, 2).map((d) => (
                <span
                  key={d}
                  className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium uppercase"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
