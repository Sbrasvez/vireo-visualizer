import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const env = (url.searchParams.get("env") || "sandbox") as StripeEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log("[payments-webhook]", event.type, "env:", env);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, env);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await upsertSubscription(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await markSubscriptionCanceled(event.data.object, env);
        break;
      case "invoice.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  // For one-time payments (Marketplace), record an order with line items
  if (session.mode === "payment") {
    const stripe = createStripeClient(env);
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
      limit: 50,
    });

    const userId = session.metadata?.userId || null;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .upsert(
        {
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent || null,
          customer_email: session.customer_details?.email || session.customer_email || "unknown@example.com",
          amount_total: session.amount_total || 0,
          currency: session.currency || "eur",
          status: "paid",
          shipping_name: session.shipping_details?.name || session.collected_information?.shipping_details?.name || null,
          shipping_address: session.shipping_details?.address || session.collected_information?.shipping_details?.address || null,
          environment: env,
        },
        { onConflict: "stripe_session_id" },
      )
      .select()
      .single();

    if (orderError) {
      console.error("Failed to upsert order", orderError);
      return;
    }

    // Insert items (idempotent: delete then insert)
    await supabase.from("order_items").delete().eq("order_id", order.id);
    const items = lineItems.data.map((li: any) => ({
      order_id: order.id,
      price_id: li.price?.metadata?.lovable_external_id || li.price?.lookup_key || li.price?.id,
      product_id: li.price?.product?.metadata?.lovable_external_id || (typeof li.price?.product === "string" ? li.price.product : li.price?.product?.id) || "unknown",
      product_name: li.description || li.price?.product?.name || "Item",
      quantity: li.quantity || 1,
      unit_amount: li.price?.unit_amount || 0,
    }));
    if (items.length > 0) await supabase.from("order_items").insert(items);
  }
  // For subscriptions, the subscription.created event handles persistence
}

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("No userId in subscription metadata", subscription.id);
    return;
  }

  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.metadata?.lovable_external_id || item?.price?.lookup_key || item?.price?.id;
  let productId = item?.price?.product;
  if (productId && typeof productId === "object") {
    productId = productId.metadata?.lovable_external_id || productId.id;
  }

  const periodStart = subscription.current_period_start;
  const periodEnd = subscription.current_period_end;

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (error) console.error("Failed to upsert subscription", error);
}

async function markSubscriptionCanceled(subscription: any, env: StripeEnv) {
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}
