import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SellerProduct } from "./useSellerProducts";

export function useProductDetail(slug: string | undefined) {
  const query = useQuery({
    queryKey: ["product-detail", slug],
    enabled: !!slug,
    queryFn: async (): Promise<SellerProduct | null> => {
      const { data, error } = await supabase
        .from("seller_products")
        .select("*, seller:sellers!inner(id, business_name, slug, logo_url, rating, status, description)")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as SellerProduct | null;
    },
  });

  // Fire-and-forget view counter
  useEffect(() => {
    const id = query.data?.id;
    if (!id) return;
    supabase.rpc("increment_product_views", { _id: id }).then(() => {});
  }, [query.data?.id]);

  return query;
}

export function useRelatedProducts(sellerId: string | undefined, excludeId: string | undefined) {
  return useQuery({
    queryKey: ["related-products", sellerId, excludeId],
    enabled: !!sellerId,
    queryFn: async (): Promise<SellerProduct[]> => {
      let q = supabase
        .from("seller_products")
        .select("*, seller:sellers!inner(id, business_name, slug, logo_url, rating, status)")
        .eq("seller_id", sellerId!)
        .eq("is_published", true)
        .eq("seller.status", "approved")
        .limit(8);
      if (excludeId) q = q.neq("id", excludeId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as SellerProduct[];
    },
  });
}
