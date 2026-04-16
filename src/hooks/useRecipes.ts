import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RecipeFilters = {
  search?: string;
  diet?: string; // "all" | "vegan" | "vegetarian" | "gluten free" | ...
  maxTime?: number; // minutes
  difficulty?: "all" | "facile" | "media" | "difficile";
  page?: number;
  pageSize?: number;
};

export type RecipeRow = {
  id: string;
  external_id: string | null;
  source: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  ready_in_minutes: number | null;
  servings: number | null;
  difficulty: "facile" | "media" | "difficile";
  diets: string[];
  dish_types: string[];
  cuisines: string[];
  ingredients: Array<{
    id?: number;
    name: string;
    amount: number;
    unit: string;
    original?: string;
    image?: string | null;
  }>;
  instructions: Array<{ number: number; step: string }>;
  nutrition: {
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    fiber?: number | null;
  } | null;
  eco_score: number | null;
  source_url: string | null;
};

export function useRecipes(filters: RecipeFilters) {
  const {
    search = "",
    diet = "all",
    maxTime,
    difficulty = "all",
    page = 1,
    pageSize = 24,
  } = filters;

  return useQuery({
    queryKey: ["recipes", { search, diet, maxTime, difficulty, page, pageSize }],
    queryFn: async () => {
      let q = supabase
        .from("recipes")
        .select("*", { count: "exact" })
        .order("eco_score", { ascending: false })
        .order("created_at", { ascending: false });

      if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);
      if (diet !== "all") q = q.contains("diets", [diet]);
      if (maxTime && maxTime > 0) q = q.lte("ready_in_minutes", maxTime);
      if (difficulty !== "all") q = q.eq("difficulty", difficulty);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await q.range(from, to);
      if (error) throw error;

      return {
        recipes: (data || []) as unknown as RecipeRow[],
        total: count || 0,
        totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
      };
    },
  });
}

export function useRecipeBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["recipe", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as RecipeRow | null;
    },
  });
}
