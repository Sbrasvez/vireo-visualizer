// Lovable AI streaming chat with tool calling (recipes/restaurants) + daily quota
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "x-quota-used, x-quota-limit, x-plan-tier",
};

const FREE_DAILY_LIMIT = 10;
const MAX_TOOL_ITERATIONS = 3;

const SYSTEM_PROMPTS: Record<string, string> = {
  it: "Sei Vireo AI, assistente per uno stile di vita sostenibile, alimentazione vegana/bio, ricette green e ristoranti eco-friendly. Rispondi sempre in italiano in modo chiaro, amichevole e pratico. Usa markdown per strutturare le risposte. Hai a disposizione due strumenti: `search_recipes` per cercare ricette nel database Vireo (usalo quando l'utente chiede ricette/idee per piatti) e `search_restaurants` per trovare ristoranti eco vicino a una posizione (usalo quando chiede di mangiare fuori, prenotare, trovare un posto). Quando ricevi i risultati di un tool, NON ripeterli elencando tutti i campi: introducili con una frase breve e naturale (max 1-2 righe), perché l'utente vede già le card. Se nessun risultato è trovato, suggerisci alternative.",
  en: "You are Vireo AI, an assistant for sustainable living, vegan/organic food, green recipes and eco-friendly restaurants. Always reply in English, clearly, friendly and practical. Use markdown. You have two tools: `search_recipes` to search the Vireo recipe database (use it when the user asks for recipes/meal ideas) and `search_restaurants` to find eco restaurants near a location (use it when the user asks to eat out, book, or find a place). After tool results, do NOT list all fields: introduce them with a short natural sentence (max 1-2 lines), the user sees the cards. If no results, suggest alternatives.",
  es: "Eres Vireo AI, asistente para un estilo de vida sostenible, comida vegana/bio y restaurantes eco. Responde siempre en español, claro y práctico. Usa markdown. Tienes dos herramientas: `search_recipes` para buscar recetas y `search_restaurants` para restaurantes eco cercanos. Tras los resultados, no enumeres campos: introdúcelos con una frase breve, el usuario ya ve las tarjetas.",
  fr: "Tu es Vireo AI, assistant pour un mode de vie durable, cuisine vegan/bio et restaurants éco. Réponds toujours en français, clair et pratique. Utilise markdown. Tu as deux outils: `search_recipes` pour les recettes et `search_restaurants` pour les restaurants éco à proximité. Après les résultats, n'énumère pas les champs: introduis-les en une phrase brève, l'utilisateur voit déjà les cartes.",
  de: "Du bist Vireo AI, Assistent für nachhaltigen Lebensstil, vegan/bio Küche und Öko-Restaurants. Antworte immer auf Deutsch, klar und praktisch. Nutze Markdown. Du hast zwei Tools: `search_recipes` für Rezepte und `search_restaurants` für Öko-Restaurants in der Nähe. Nach den Tool-Ergebnissen liste keine Felder auf: stelle sie mit einem kurzen Satz vor, der Nutzer sieht die Karten.",
};

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_recipes",
      description:
        "Search the Vireo recipe database. Use when the user asks for vegan/organic recipes, meal ideas, dishes by ingredient, or recipe filters.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Free-text search on recipe title and summary (e.g. 'pasta', 'curry lenticchie', 'tofu'). Optional.",
          },
          diets: {
            type: "array",
            items: {
              type: "string",
              enum: ["vegan", "vegetarian", "gluten free", "dairy free", "ketogenic"],
            },
            description: "Diet filters. Optional.",
          },
          max_minutes: {
            type: "integer",
            description: "Maximum prep time in minutes. Optional.",
          },
          difficulty: {
            type: "string",
            enum: ["facile", "media", "difficile"],
            description: "Recipe difficulty. Optional.",
          },
          limit: {
            type: "integer",
            description: "Max recipes to return (1-6). Default 4.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_restaurants",
      description:
        "Find eco-friendly restaurants near a location. Use when the user asks where to eat, book a table, or find restaurants in a city/area.",
      parameters: {
        type: "object",
        properties: {
          near_lat: { type: "number", description: "User latitude. Provide if known." },
          near_lng: { type: "number", description: "User longitude. Provide if known." },
          city: {
            type: "string",
            description: "City or area name (e.g. 'Milano', 'Roma Trastevere'). Use this if no coordinates are available.",
          },
          cuisine: {
            type: "array",
            items: {
              type: "string",
              enum: ["vegano", "vegetariano", "plant_based", "bio", "mediterraneo", "crudista", "fusion", "km_zero"],
            },
            description: "Cuisine type filters. Optional.",
          },
          price: {
            type: "array",
            items: { type: "string", enum: ["€", "€€", "€€€", "€€€€"] },
            description: "Price range filters. Optional.",
          },
          radius_km: {
            type: "number",
            description: "Search radius in km from coordinates. Default 25. Ignored when only city is given.",
          },
          available_only: { type: "boolean", description: "Only currently available. Default false." },
          limit: { type: "integer", description: "Max restaurants (1-6). Default 4." },
        },
      },
    },
  },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  const token = Deno.env.get("MAPBOX_PUBLIC_TOKEN");
  if (!token) return null;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${token}&country=it&limit=1`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    const feat = j.features?.[0];
    if (!feat?.center) return null;
    return { lng: feat.center[0], lat: feat.center[1] };
  } catch {
    return null;
  }
}

async function execSearchRecipes(admin: any, args: any) {
  const limit = Math.min(Math.max(Number(args.limit) || 4, 1), 6);
  let q = admin
    .from("recipes")
    .select("id, slug, title, image, ready_in_minutes, diets, difficulty, summary, eco_score")
    .limit(limit);

  if (args.query && typeof args.query === "string") {
    q = q.or(`title.ilike.%${args.query}%,summary.ilike.%${args.query}%`);
  }
  if (Array.isArray(args.diets) && args.diets.length > 0) {
    q = q.overlaps("diets", args.diets);
  }
  if (args.max_minutes && Number.isFinite(args.max_minutes)) {
    q = q.lte("ready_in_minutes", args.max_minutes);
  }
  if (args.difficulty && ["facile", "media", "difficile"].includes(args.difficulty)) {
    q = q.eq("difficulty", args.difficulty);
  }

  const { data, error } = await q;
  if (error) {
    console.error("search_recipes error:", error);
    return { ok: false, error: error.message, results: [] };
  }
  const results = (data ?? []).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    image: r.image,
    minutes: r.ready_in_minutes,
    diets: r.diets ?? [],
    difficulty: r.difficulty,
    eco_score: r.eco_score,
    summary: r.summary?.replace(/<[^>]+>/g, "").slice(0, 140) ?? null,
  }));
  return { ok: true, count: results.length, results };
}

async function execSearchRestaurants(admin: any, args: any) {
  const limit = Math.min(Math.max(Number(args.limit) || 4, 1), 6);
  const radius = Number(args.radius_km) || 25;

  let lat = Number.isFinite(args.near_lat) ? Number(args.near_lat) : null;
  let lng = Number.isFinite(args.near_lng) ? Number(args.near_lng) : null;

  if ((lat === null || lng === null) && args.city) {
    const geo = await geocodeCity(args.city);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
    }
  }

  let q = admin
    .from("restaurants")
    .select(
      "id, slug, name, city, address, cover_image, cuisine, price, rating, reviews_count, available_now, lat, lng, short_description",
    )
    .limit(50);

  if (Array.isArray(args.cuisine) && args.cuisine.length > 0) {
    q = q.overlaps("cuisine", args.cuisine);
  }
  if (Array.isArray(args.price) && args.price.length > 0) {
    q = q.in("price", args.price);
  }
  if (args.available_only === true) {
    q = q.eq("available_now", true);
  }

  const { data, error } = await q;
  if (error) {
    console.error("search_restaurants error:", error);
    return { ok: false, error: error.message, results: [] };
  }

  let rows = data ?? [];
  if (lat !== null && lng !== null) {
    rows = rows
      .map((r: any) => ({ ...r, distance_km: haversineKm(lat!, lng!, r.lat, r.lng) }))
      .filter((r: any) => r.distance_km <= radius)
      .sort((a: any, b: any) => a.distance_km - b.distance_km);
  } else {
    rows = rows.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  const results = rows.slice(0, limit).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    city: r.city,
    address: r.address,
    image: r.cover_image,
    cuisine: r.cuisine ?? [],
    price: r.price,
    rating: r.rating,
    reviews_count: r.reviews_count,
    available_now: r.available_now,
    short_description: r.short_description,
    distance_km: r.distance_km ? Math.round(r.distance_km * 10) / 10 : null,
  }));
  return {
    ok: true,
    count: results.length,
    origin: lat !== null && lng !== null ? { lat, lng } : null,
    results,
  };
}

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
    const userGeo =
      body?.user_location &&
      Number.isFinite(body.user_location.lat) &&
      Number.isFinite(body.user_location.lng)
        ? { lat: Number(body.user_location.lat), lng: Number(body.user_location.lng) }
        : null;

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
        JSON.stringify({ error: "quota_exceeded", limit: FREE_DAILY_LIMIT, used: count }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await admin.from("user_plans").upsert(
      {
        user_id: userId,
        tier,
        ai_messages_today: count + 1,
        ai_messages_reset_at: today,
      },
      { onConflict: "user_id" },
    );

    let systemPrompt = SYSTEM_PROMPTS[lang] ?? SYSTEM_PROMPTS.it;
    if (userGeo) {
      systemPrompt += `\n\nUser current location: lat=${userGeo.lat.toFixed(4)}, lng=${userGeo.lng.toFixed(4)}. Pass these as near_lat/near_lng to search_restaurants when the user asks for nearby places without specifying a city.`;
    }

    // We stream a custom merged SSE: gateway tokens are forwarded as-is,
    // and tool results are emitted as `data: {"vireo":"cards", ...}` events.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (obj: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        };
        const sendDone = () => {
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        };

        let conversation = [{ role: "system", content: systemPrompt }, ...messages];

        try {
          for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
            const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: conversation,
                tools: TOOLS,
                stream: true,
              }),
            });

            if (!aiResp.ok || !aiResp.body) {
              const errTxt = await aiResp.text().catch(() => "");
              console.error("AI gateway error:", aiResp.status, errTxt);
              send({
                vireo: "error",
                status: aiResp.status,
                error:
                  aiResp.status === 429
                    ? "rate_limited"
                    : aiResp.status === 402
                      ? "payment_required"
                      : "ai_error",
              });
              sendDone();
              return;
            }

            const reader = aiResp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let assistantContent = "";
            // Aggregate tool calls across deltas: by index
            const toolCallsAgg: Record<
              number,
              { id?: string; name?: string; args: string }
            > = {};
            let finishReason: string | null = null;

            outer: while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              let idx: number;
              while ((idx = buffer.indexOf("\n")) !== -1) {
                let line = buffer.slice(0, idx);
                buffer = buffer.slice(idx + 1);
                if (line.endsWith("\r")) line = line.slice(0, -1);
                if (!line || line.startsWith(":")) continue;
                if (!line.startsWith("data: ")) continue;
                const json = line.slice(6).trim();
                if (json === "[DONE]") break outer;
                try {
                  const parsed = JSON.parse(json);
                  const choice = parsed.choices?.[0];
                  const delta = choice?.delta ?? {};
                  if (delta.content) {
                    assistantContent += delta.content;
                    // Forward token to client
                    send({ choices: [{ delta: { content: delta.content } }] });
                  }
                  if (Array.isArray(delta.tool_calls)) {
                    for (const tc of delta.tool_calls) {
                      const i = tc.index ?? 0;
                      if (!toolCallsAgg[i]) toolCallsAgg[i] = { args: "" };
                      if (tc.id) toolCallsAgg[i].id = tc.id;
                      if (tc.function?.name) toolCallsAgg[i].name = tc.function.name;
                      if (tc.function?.arguments)
                        toolCallsAgg[i].args += tc.function.arguments;
                    }
                  }
                  if (choice?.finish_reason) finishReason = choice.finish_reason;
                } catch {
                  buffer = line + "\n" + buffer;
                  break;
                }
              }
            }

            const toolCalls = Object.entries(toolCallsAgg)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([, v]) => v)
              .filter((v) => v.name);

            if (toolCalls.length === 0 || finishReason !== "tool_calls") {
              // Plain answer or no more tools -> done
              sendDone();
              return;
            }

            // Append assistant turn with tool_calls
            conversation.push({
              role: "assistant",
              content: assistantContent || "",
              tool_calls: toolCalls.map((tc, i) => ({
                id: tc.id ?? `call_${iter}_${i}`,
                type: "function",
                function: { name: tc.name!, arguments: tc.args || "{}" },
              })),
            });

            // Execute each tool
            for (let i = 0; i < toolCalls.length; i++) {
              const tc = toolCalls[i];
              const callId = tc.id ?? `call_${iter}_${i}`;
              let parsedArgs: any = {};
              try {
                parsedArgs = JSON.parse(tc.args || "{}");
              } catch {
                parsedArgs = {};
              }

              // If user_geo is present and tool needs it, inject as default
              if (
                tc.name === "search_restaurants" &&
                userGeo &&
                !Number.isFinite(parsedArgs.near_lat) &&
                !Number.isFinite(parsedArgs.near_lng) &&
                !parsedArgs.city
              ) {
                parsedArgs.near_lat = userGeo.lat;
                parsedArgs.near_lng = userGeo.lng;
              }

              let result: any;
              if (tc.name === "search_recipes") {
                result = await execSearchRecipes(admin, parsedArgs);
                send({
                  vireo: "cards",
                  kind: "recipes",
                  call_id: callId,
                  data: result.results,
                });
              } else if (tc.name === "search_restaurants") {
                result = await execSearchRestaurants(admin, parsedArgs);
                send({
                  vireo: "cards",
                  kind: "restaurants",
                  call_id: callId,
                  data: result.results,
                });
              } else {
                result = { ok: false, error: "unknown_tool" };
              }

              conversation.push({
                role: "tool",
                tool_call_id: callId,
                content: JSON.stringify(result).slice(0, 8000),
              });
            }
            // Loop again so the model can produce a natural follow-up message
          }
          sendDone();
        } catch (e) {
          console.error("stream error:", e);
          send({ vireo: "error", error: e instanceof Error ? e.message : "unknown" });
          sendDone();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Quota-Used": String(count + 1),
        "X-Quota-Limit": tier === "free" ? String(FREE_DAILY_LIMIT) : "unlimited",
        "X-Plan-Tier": tier,
      },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
