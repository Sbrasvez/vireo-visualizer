import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  priceId: string;
  quantity?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      items,
      priceId,
      quantity,
      customerEmail,
      userId,
      returnUrl,
      environment,
      mode: requestedMode,
    } = await req.json();

    const cart: CartItem[] = items && Array.isArray(items)
      ? items
      : priceId
      ? [{ priceId, quantity: quantity || 1 }]
      : [];

    if (cart.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const it of cart) {
      if (!it.priceId || !/^[a-zA-Z0-9_-]+$/.test(it.priceId)) {
        return new Response(JSON.stringify({ error: `Invalid priceId: ${it.priceId}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const env = (environment || "sandbox") as StripeEnv;
    const stripe = createStripeClient(env);

    // Resolve all human-readable price IDs to Stripe price IDs
    const lookupKeys = cart.map((c) => c.priceId);
    const prices = await stripe.prices.list({
      lookup_keys: lookupKeys,
      expand: ["data.product"],
    });

    if (prices.data.length !== cart.length) {
      const found = new Set(prices.data.map((p) => p.lookup_key));
      const missing = cart
        .map((c) => c.priceId)
        .filter((k) => !found.has(k));
      return new Response(
        JSON.stringify({ error: `Prices not found: ${missing.join(", ")}` }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const lineItems = cart.map((c) => {
      const price = prices.data.find((p) => p.lookup_key === c.priceId)!;
      return { price: price.id, quantity: c.quantity || 1 };
    });

    const isAnyRecurring = prices.data.some((p) => p.type === "recurring");
    const mode =
      requestedMode === "subscription" || isAnyRecurring ? "subscription" : "payment";

    if (mode === "subscription" && cart.length > 1) {
      return new Response(
        JSON.stringify({ error: "Subscriptions must be purchased one at a time" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode,
      ui_mode: "embedded",
      return_url:
        returnUrl ||
        `${req.headers.get("origin")}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      ...(customerEmail && { customer_email: customerEmail }),
      ...(userId && {
        metadata: { userId, env },
        ...(mode === "subscription" && {
          subscription_data: { metadata: { userId, env } },
        }),
      }),
      ...(mode === "payment" && {
        shipping_address_collection: { allowed_countries: ["IT", "FR", "DE", "ES", "AT", "CH", "GB"] },
      }),
    });

    return new Response(
      JSON.stringify({ clientSecret: session.client_secret }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("create-checkout error", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
