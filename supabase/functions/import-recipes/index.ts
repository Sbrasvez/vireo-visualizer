import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function mapDifficulty(min?: number): "facile" | "media" | "difficile" {
  if (!min) return "facile";
  if (min <= 20) return "facile";
  if (min <= 45) return "media";
  return "difficile";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SPOONACULAR_API_KEY = Deno.env.get("SPOONACULAR_API_KEY");
    if (!SPOONACULAR_API_KEY) throw new Error("SPOONACULAR_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { number = 100, diet = "vegan", language = "it" } = await req.json().catch(() => ({}));

    // Fetch in batches of 50 (Spoonacular max per request)
    const all: any[] = [];
    const batchSize = 50;
    for (let offset = 0; offset < number; offset += batchSize) {
      const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
      url.searchParams.set("apiKey", SPOONACULAR_API_KEY);
      url.searchParams.set("diet", diet);
      url.searchParams.set("addRecipeInformation", "true");
      url.searchParams.set("addRecipeNutrition", "true");
      url.searchParams.set("instructionsRequired", "true");
      url.searchParams.set("fillIngredients", "true");
      url.searchParams.set("number", String(Math.min(batchSize, number - offset)));
      url.searchParams.set("offset", String(offset));
      // Translate recipe content (title, summary, instructions, ingredients) — Spoonacular supports it/de/es/fr
      if (language && language !== "en") {
        url.searchParams.set("language", language);
      }

      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Spoonacular ${res.status}: ${txt.slice(0, 200)}`);
      }
      const data = await res.json();
      all.push(...(data.results || []));
      if ((data.results || []).length < batchSize) break;
    }

    const seenSlugs = new Set<string>();
    const rows = all.map((r: any) => {
      let slug = slugify(r.title || `recipe-${r.id}`);
      if (seenSlugs.has(slug)) slug = `${slug}-${r.id}`;
      seenSlugs.add(slug);

      const ingredients = (r.extendedIngredients || []).map((ing: any) => ({
        id: ing.id,
        name: ing.nameClean || ing.name,
        amount: ing.amount,
        unit: ing.unit || "",
        original: ing.original,
        image: ing.image ? `https://spoonacular.com/cdn/ingredients_100x100/${ing.image}` : null,
      }));

      const steps =
        r.analyzedInstructions?.[0]?.steps?.map((s: any) => ({
          number: s.number,
          step: s.step,
        })) || [];

      const nutrients = r.nutrition?.nutrients || [];
      const findN = (name: string) =>
        nutrients.find((n: any) => n.name === name)?.amount ?? null;

      const nutrition = {
        calories: findN("Calories"),
        protein: findN("Protein"),
        carbs: findN("Carbohydrates"),
        fat: findN("Fat"),
        fiber: findN("Fiber"),
      };

      // Eco score: heuristic based on diet
      let eco = 8.5;
      if ((r.diets || []).includes("vegan")) eco = 9.4;
      else if ((r.diets || []).includes("vegetarian")) eco = 8.8;

      return {
        external_id: String(r.id),
        source: "spoonacular",
        title: r.title,
        slug,
        summary: r.summary?.replace(/<[^>]+>/g, "").slice(0, 500) || null,
        image: r.image,
        ready_in_minutes: r.readyInMinutes,
        servings: r.servings || 2,
        difficulty: mapDifficulty(r.readyInMinutes),
        diets: r.diets || [],
        dish_types: r.dishTypes || [],
        cuisines: r.cuisines || [],
        ingredients,
        instructions: steps,
        nutrition,
        eco_score: eco,
        source_url: r.sourceUrl || r.spoonacularSourceUrl || null,
      };
    });

    const { error } = await supabase
      .from("recipes")
      .upsert(rows, { onConflict: "external_id" });
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, imported: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("import-recipes error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
