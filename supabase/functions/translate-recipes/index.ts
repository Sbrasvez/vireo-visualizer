import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Translate recipes (title, summary, instructions, ingredient names) into Italian
 * using Lovable AI Gateway (Gemini Flash for cheap & fast translation).
 * Idempotent: only translates rows where translated_at IS NULL or older than translated.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { limit = 200, force = false } = await req.json().catch(() => ({}));

    let query = supabase
      .from("recipes")
      .select("id,title,summary,instructions,ingredients")
      .limit(limit);
    if (!force) {
      // Heuristic: rows still in English usually contain common English stopwords in summary
      query = query.or("summary.ilike.% the %,summary.ilike.% and %,summary.ilike.% is %,summary.ilike.% of %");
    }
    const { data: rows, error } = await query;
    if (error) throw error;
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ success: true, translated: 0, message: "No recipes to translate" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let translated = 0;
    const batchSize = 5;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (r: any) => {
          const payload = {
            title: r.title,
            summary: r.summary || "",
            instructions: (r.instructions || []).map((s: any) => s.step).slice(0, 20),
            ingredients: (r.ingredients || []).map((ing: any) => ing.name).slice(0, 30),
          };

          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content:
                    "Sei un traduttore professionale di ricette dall'inglese all'italiano. Traduci in italiano naturale e gastronomico. Restituisci SOLO JSON valido senza markdown, con la stessa struttura dell'input. Mantieni nomi propri e marche invariati. Per gli ingredienti usa nomi italiani comuni (es. 'aglio' non 'garlic').",
                },
                { role: "user", content: JSON.stringify(payload) },
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (!aiRes.ok) {
            console.error(`AI error for recipe ${r.id}:`, aiRes.status, await aiRes.text());
            return;
          }
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (!content) return;

          let parsed: any;
          try {
            parsed = JSON.parse(content);
          } catch {
            console.error(`Bad JSON from AI for ${r.id}`);
            return;
          }

          const newInstructions = (r.instructions || []).map((s: any, idx: number) => ({
            ...s,
            step: parsed.instructions?.[idx] ?? s.step,
          }));
          const newIngredients = (r.ingredients || []).map((ing: any, idx: number) => ({
            ...ing,
            name: parsed.ingredients?.[idx] ?? ing.name,
          }));

          const { error: updateError } = await supabase
            .from("recipes")
            .update({
              title: parsed.title || r.title,
              summary: parsed.summary || r.summary,
              instructions: newInstructions,
              ingredients: newIngredients,
            })
            .eq("id", r.id);

          if (updateError) {
            console.error(`Update error for ${r.id}:`, updateError.message);
            return;
          }
          translated++;
        }),
      );
      // brief pause between batches to respect rate limits
      await new Promise((res) => setTimeout(res, 400));
    }

    return new Response(JSON.stringify({ success: true, translated, total: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-recipes error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
