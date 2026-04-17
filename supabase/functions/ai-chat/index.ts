// Lovable AI streaming chat with daily quota enforcement for free tier
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_DAILY_LIMIT = 10;

const SYSTEM_PROMPTS: Record<string, string> = {
  it: "Sei Vireo AI, un assistente per uno stile di vita sostenibile, alimentazione vegana/bio, ricette green, ristoranti eco-friendly e riduzione dell'impatto ambientale. Rispondi sempre in italiano in modo chiaro, amichevole e pratico. Usa markdown (titoli, liste, grassetto) per strutturare le risposte. Quando suggerisci ricette, indica brevemente ingredienti chiave, tempo di preparazione ed eco-score qualitativo.",
  en: "You are Vireo AI, an assistant for sustainable living, vegan/organic food, green recipes, eco-friendly restaurants and reducing environmental impact. Always reply in English, clearly, friendly and practical. Use markdown for structure.",
  es: "Eres Vireo AI, un asistente de vida sostenible, comida vegana/orgánica y recetas eco. Responde siempre en español, claro y práctico. Usa markdown.",
  fr: "Tu es Vireo AI, un assistant pour un mode de vie durable, cuisine vegan/bio et restaurants éco. Réponds toujours en français, clair et pratique. Utilise markdown.",
  de: "Du bist Vireo AI, ein Assistent für nachhaltigen Lebensstil, vegane/bio Küche und Öko-Restaurants. Antworte immer auf Deutsch, klar und praktisch. Nutze Markdown.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lang = typeof body?.lang === "string" ? body.lang : "it";
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "missing messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Quota check via service role
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().slice(0, 10);

    const { data: planRow } = await admin
      .from("user_plans")
      .select("tier, ai_messages_today, ai_messages_reset_at")
      .eq("user_id", userId)
      .maybeSingle();

    const tier = planRow?.tier ?? "free";
    let count = planRow?.ai_messages_today ?? 0;
    const resetAt = planRow?.ai_messages_reset_at ?? today;

    if (resetAt !== today) count = 0;

    if (tier === "free" && count >= FREE_DAILY_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "quota_exceeded",
          limit: FREE_DAILY_LIMIT,
          used: count,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Increment quota (upsert)
    await admin.from("user_plans").upsert(
      {
        user_id: userId,
        tier,
        ai_messages_today: count + 1,
        ai_messages_reset_at: today,
      },
      { onConflict: "user_id" },
    );

    const systemPrompt = SYSTEM_PROMPTS[lang] ?? SYSTEM_PROMPTS.it;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "payment_required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "ai_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResp.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Quota-Used": String(count + 1),
        "X-Quota-Limit": tier === "free" ? String(FREE_DAILY_LIMIT) : "unlimited",
        "X-Plan-Tier": tier,
      },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
