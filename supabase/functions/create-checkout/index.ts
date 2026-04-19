import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  // For seller products: priceId is the seller_products UUID and kind = "seller_product"
  // For Stripe-priced items (subscriptions): priceId is a Stripe lookup_key
  priceId: string;
  productId?: string;
  quantity?: number;
  kind?: "seller_product" | "stripe_price";
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabaseAdmin = createClient(
  SUPABASE_URL,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// Allowlist of origins permitted as return_url hosts.
const ALLOWED_RETURN_HOSTS = new Set<string>([
  "lovable.app",
  "lovable.dev",
  "localhost",
  "127.0.0.1",
]);

function isAllowedReturnUrl(url: string, requestOrigin: string | null): boolean {
  try {
    const u = new URL(url);
    if (requestOrigin) {
      try {
        const o = new URL(requestOrigin);
        if (o.host === u.host) return true;
      } catch (_) { /* ignore */ }
    }
    // Allow lovable preview/published subdomains and localhost dev
    return Array.from(ALLOWED_RETURN_HOSTS).some(
      (h) => u.hostname === h || u.hostname.endsWith(`.${h}`),
    );
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require an authenticated caller — derive userId from the verified JWT.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsErr } = await supabaseUser.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const verifiedUserId = claimsData.claims.sub as string;
    const verifiedEmail = (claimsData.claims.email as string | undefined) ?? undefined;

    const {
      items,
      priceId,
      quantity,
      returnUrl,
      environment,
      mode: requestedMode,
    } = await req.json();

    // Always derive identity from JWT — never trust client-supplied userId/email.
    const userId = verifiedUserId;
    const customerEmail = verifiedEmail;

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
      if (!it.priceId) {
        return new Response(JSON.stringify({ error: "Missing priceId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const env = (environment || "sandbox") as StripeEnv;
    const stripe = createStripeClient(env);

    // Split cart by kind. Heuristic: UUID + kind=seller_product → DB lookup; otherwise Stripe lookup_key.
    const sellerItems = cart.filter((c) => c.kind === "seller_product" || (isUuid(c.priceId) && c.kind !== "stripe_price"));
    const stripeItems = cart.filter((c) => !sellerItems.includes(c));

    const lineItems: any[] = [];
    let isAnyRecurring = false;
    const sellerLineMeta: Array<{
      product_id: string;
      seller_id: string;
      product_name: string;
      product_image: string | null;
      unit_amount_cents: number;
      quantity: number;
      shipping_cents: number;
      commission_rate: number;
    }> = [];
    let totalShippingCents = 0;

    if (sellerItems.length > 0) {
      const ids = sellerItems.map((s) => s.priceId);
      const { data: products, error: prodErr } = await supabaseAdmin
        .from("seller_products")
        .select("id, name, price_cents, primary_image, images, stock, unlimited_stock, shipping_cents, seller_id, seller:sellers!inner(id, status, commission_rate, business_name)")
        .in("id", ids)
        .eq("is_published", true);

      if (prodErr) throw prodErr;

      const byId = new Map((products ?? []).map((p: any) => [p.id, p]));
      // Track shipping per seller (charge max once per seller)
      const sellerShipMap = new Map<string, number>();

      for (const it of sellerItems) {
        const p = byId.get(it.priceId);
        if (!p) {
          return new Response(JSON.stringify({ error: `Product not found or unpublished: ${it.priceId}` }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (p.seller?.status !== "approved") {
          return new Response(JSON.stringify({ error: `Seller not approved for product ${p.name}` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const qty = Math.max(1, it.quantity ?? 1);
        if (!p.unlimited_stock && p.stock < qty) {
          return new Response(JSON.stringify({ error: `Insufficient stock for ${p.name}` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const image = p.primary_image ?? p.images?.[0] ?? null;
        const commission = Number(p.seller?.commission_rate ?? 0.15);

        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: {
              name: p.name,
              ...(image ? { images: [image] } : {}),
              metadata: {
                seller_product_id: p.id,
                seller_id: p.seller_id,
              },
            },
            unit_amount: p.price_cents,
          },
          quantity: qty,
        });

        sellerLineMeta.push({
          product_id: p.id,
          seller_id: p.seller_id,
          product_name: p.name,
          product_image: image,
          unit_amount_cents: p.price_cents,
          quantity: qty,
          shipping_cents: p.shipping_cents ?? 0,
          commission_rate: commission,
        });

        if ((p.shipping_cents ?? 0) > 0) {
          sellerShipMap.set(
            p.seller_id,
            Math.max(sellerShipMap.get(p.seller_id) ?? 0, p.shipping_cents),
          );
        }
      }
      totalShippingCents = Array.from(sellerShipMap.values()).reduce((s, n) => s + n, 0);

      if (totalShippingCents > 0) {
        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: { name: "Spedizione", metadata: { kind: "shipping" } },
            unit_amount: totalShippingCents,
          },
          quantity: 1,
        });
      }
    }

    if (stripeItems.length > 0) {
      const lookupKeys = stripeItems.map((c) => c.priceId);
      const prices = await stripe.prices.list({ lookup_keys: lookupKeys, expand: ["data.product"] });
      if (prices.data.length !== stripeItems.length) {
        const found = new Set(prices.data.map((p) => p.lookup_key));
        const missing = stripeItems.map((c) => c.priceId).filter((k) => !found.has(k));
        return new Response(JSON.stringify({ error: `Prices not found: ${missing.join(", ")}` }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (const c of stripeItems) {
        const price = prices.data.find((p) => p.lookup_key === c.priceId)!;
        if (price.type === "recurring") isAnyRecurring = true;
        lineItems.push({ price: price.id, quantity: c.quantity || 1 });
      }
    }

    const mode = requestedMode === "subscription" || isAnyRecurring ? "subscription" : "payment";
    if (mode === "subscription" && cart.length > 1) {
      return new Response(JSON.stringify({ error: "Subscriptions must be purchased one at a time" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Encode marketplace metadata so the webhook can build marketplace_orders rows.
    const isMarketplace = sellerLineMeta.length > 0;
    const metadata: Record<string, string> = {
      ...(userId && { userId }),
      env,
      ...(isMarketplace && {
        marketplace: "1",
        shipping_cents: String(totalShippingCents),
        items: JSON.stringify(sellerLineMeta),
      }),
    };

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode,
      ui_mode: "embedded",
      return_url:
        returnUrl ||
        `${req.headers.get("origin")}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      ...(customerEmail && { customer_email: customerEmail }),
      metadata,
      ...(mode === "subscription" && {
        subscription_data: { metadata: { ...(userId && { userId }), env } },
      }),
      ...(mode === "payment" && {
        shipping_address_collection: { allowed_countries: ["IT", "FR", "DE", "ES", "AT", "CH", "GB"] },
      }),
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-checkout error", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
