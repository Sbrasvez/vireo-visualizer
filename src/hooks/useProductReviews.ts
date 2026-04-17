import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-reviews", productId],
    enabled: !!productId,
    queryFn: async (): Promise<ProductReview[]> => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductReview[];
    },
  });
}

export function useMyProductReview(productId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["product-review-mine", productId, user?.id],
    enabled: !!productId && !!user,
    queryFn: async (): Promise<ProductReview | null> => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as ProductReview | null;
    },
  });
}

export function useUpsertProductReview(productId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { rating: number; title?: string; body?: string; author_name: string }) => {
      if (!user) throw new Error("Devi essere loggato");
      if (!productId) throw new Error("Prodotto mancante");
      const { error } = await supabase
        .from("product_reviews")
        .upsert(
          {
            product_id: productId,
            user_id: user.id,
            author_name: input.author_name,
            rating: input.rating,
            title: input.title ?? null,
            body: input.body ?? null,
          },
          { onConflict: "product_id,user_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recensione salvata");
      qc.invalidateQueries({ queryKey: ["product-reviews", productId] });
      qc.invalidateQueries({ queryKey: ["product-review-mine", productId] });
      qc.invalidateQueries({ queryKey: ["product-detail"] });
      qc.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}

export function useDeleteProductReview(productId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user || !productId) return;
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recensione eliminata");
      qc.invalidateQueries({ queryKey: ["product-reviews", productId] });
      qc.invalidateQueries({ queryKey: ["product-review-mine", productId] });
      qc.invalidateQueries({ queryKey: ["product-detail"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}
