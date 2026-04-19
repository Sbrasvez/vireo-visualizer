import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

export interface CheckoutItem {
  priceId: string;
  quantity?: number;
}

interface Props {
  items: CheckoutItem[];
  /** @deprecated server derives email from the authenticated user */
  customerEmail?: string;
  /** @deprecated server derives userId from the authenticated user */
  userId?: string;
  returnUrl?: string;
  mode?: "payment" | "subscription";
}

export function StripeEmbeddedCheckout({
  items,
  returnUrl,
  mode,
}: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    // Identity (userId, email) is derived server-side from the JWT — never sent from the client.
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        items,
        returnUrl,
        mode,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || data?.error || "Failed to create checkout session");
    }
    return data.clientSecret as string;
  };

  return (
    <div id="checkout" className="rounded-xl overflow-hidden">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
