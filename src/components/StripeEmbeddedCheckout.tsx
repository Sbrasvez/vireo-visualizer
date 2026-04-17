import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

export interface CheckoutItem {
  priceId: string;
  quantity?: number;
}

interface Props {
  items: CheckoutItem[];
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
  mode?: "payment" | "subscription";
}

export function StripeEmbeddedCheckout({
  items,
  customerEmail,
  userId,
  returnUrl,
  mode,
}: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        items,
        customerEmail,
        userId,
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
