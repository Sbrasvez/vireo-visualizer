import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Preferences {
  diet?: string;
  calories?: number;
  allergies?: string[];
  servings?: number;
  weekStart?: string; // ISO date (Mon)
}

const MEAL_PLAN_TOOL = {
  type: "function",
  function: {
    name: "return_meal_plan",
    description: "Restituisce un piano settimanale di 7 giorni di ricette plant-based personalizzate.",
    parameters: {
      type: "object",
      properties: {
        days: {
          type: "array",
          minItems: 7,
          maxItems: 7,
          items: {
            type: "object",
            properties: {
              day: { type: "string", description: "Giorno della settimana in italiano (Lunedì..Domenica)" },
              meals: {
                type: "object",
                properties: {
                  breakfast: { type: "string", description: "Nome ricetta colazione" },
                  lunch: { type: "string" },
                  dinner: { type: "string" },
                },
                required: ["breakfast", "lunch", "dinner"],
                additionalProperties: false,
              },
              estimated_calories: { type: "number" },
              ingredients: {
                type: "array",
                items: { type: "string" },
                description: "Lista ingredienti aggregati per il giorno",
              },
            },
            required: ["day", "meals", "estimated_calories", "ingredients"],
            additionalProperties: false,
          },
        },
        shopping_list: {
          type: "array",
          items: { type: "string" },
          description: "Lista spesa aggregata per la settimana",
        },
        eco_score: { type: "number", description: "Punteggio sostenibilità 0-10" },
      },
      required: ["days", "shopping_list", "eco_score"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(authHeader);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prefs = (await req.json()) as Preferences;
    const diet = prefs.diet ?? "plant-based";
    const calories = prefs.calories ?? 2000;
    const allergies = (prefs.allergies ?? []).join(", ") || "nessuna";
    const servings = prefs.servings ?? 2;
    const weekStart = prefs.weekStart ?? new Date().toISOString().slice(0, 10);

    const systemPrompt = `Sei uno chef nutrizionista esperto in cucina sostenibile. Crei piani settimanali plant-based bilanciati, stagionali italiani, a basso impatto ambientale. Rispondi sempre chiamando il tool return_meal_plan.`;

    const userPrompt = `Genera un piano settimanale di 7 giorni con queste preferenze:
- Dieta: ${diet}
- Calorie target/giorno: ${calories}
- Porzioni: ${servings}
- Allergie/intolleranze: ${allergies}
- Settimana che inizia: ${weekStart}

Per ogni giorno indica colazione, pranzo, cena (nomi ricette concreti italiani), calorie stimate, e ingredienti principali. Aggrega anche una shopping_list settimanale unica e dai un eco_score 0-10.`;

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [MEAL_PLAN_TOOL],
          tool_choice: { type: "function", function: { name: "return_meal_plan" } },
        }),
      },
    );

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit superato, riprova tra poco." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call returned", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Generazione fallita" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const planData = JSON.parse(toolCall.function.arguments);

    // Upsert (one plan per user per week_start)
    const { data: saved, error: saveError } = await supabase
      .from("meal_plans")
      .upsert(
        {
          user_id: user.id,
          week_start: weekStart,
          preferences: prefs,
          plan_data: planData,
        },
        { onConflict: "user_id,week_start" },
      )
      .select()
      .single();

    if (saveError) {
      console.error("Save error", saveError);
      return new Response(JSON.stringify({ error: saveError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ plan: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-meal-plan error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
