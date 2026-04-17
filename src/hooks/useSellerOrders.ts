import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SellerOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  seller_id: string | null;
  product_name: string;
  product_image: string | null;
  unit_amount_cents: number;
  quantity: number;
  line_total_cents: number;
  commission_rate: number;
  platform_fee_cents: number;
  seller_amount_cents: number;
  fulfillment_status: "pending" | "shipped" | "delivered" | "cancelled";
  tracking_number: string | null;
  created_at: string;
  order?: {
    customer_email: string;
    customer_name: string | null;
    status: string;
    created_at: string;
    shipping_address: any;
  };
}

export function useSellerOrders(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["seller-orders", sellerId],
    enabled: !!sellerId,
    queryFn: async (): Promise<SellerOrderItem[]> => {
      const { data, error } = await supabase
        .from("marketplace_order_items")
        .select(
          "*, order:marketplace_orders(customer_email, customer_name, status, created_at, shipping_address)",
        )
        .eq("seller_id", sellerId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as SellerOrderItem[];
    },
  });
}

export function useUpdateFulfillment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      status,
      tracking,
    }: {
      itemId: string;
      status: SellerOrderItem["fulfillment_status"];
      tracking?: string;
    }) => {
      const { error } = await supabase
        .from("marketplace_order_items")
        .update({
          fulfillment_status: status,
          tracking_number: tracking ?? null,
        })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Stato aggiornato");
      qc.invalidateQueries({ queryKey: ["seller-orders"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}

export function useMyMarketplaceOrders() {
  return useQuery({
    queryKey: ["my-marketplace-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_orders")
        .select("*, items:marketplace_order_items(*)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}
