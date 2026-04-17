import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ProductQuestion {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  answered_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SellerQuestion extends ProductQuestion {
  product?: { id: string; name: string; slug: string; primary_image: string | null };
}

export function useProductQuestions(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-questions", productId],
    enabled: !!productId,
    queryFn: async (): Promise<ProductQuestion[]> => {
      const { data, error } = await supabase
        .from("product_questions")
        .select("*")
        .eq("product_id", productId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductQuestion[];
    },
  });
}

export function useAskProductQuestion(productId: string | undefined) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: { question: string; author_name: string }) => {
      if (!user) throw new Error("Devi accedere per fare una domanda");
      if (!productId) throw new Error("Prodotto non valido");
      const { data, error } = await supabase
        .from("product_questions")
        .insert({
          product_id: productId,
          user_id: user.id,
          author_name: payload.author_name,
          question: payload.question.trim(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as ProductQuestion;
    },
    onSuccess: () => {
      toast.success("Domanda pubblicata");
      qc.invalidateQueries({ queryKey: ["product-questions", productId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore invio domanda"),
  });
}

export function useDeleteProductQuestion(productId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Domanda eliminata");
      qc.invalidateQueries({ queryKey: ["product-questions", productId] });
      qc.invalidateQueries({ queryKey: ["seller-questions"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}

/** Seller: list all questions across own products (optionally only unanswered). */
export function useSellerQuestions(sellerId: string | undefined, onlyUnanswered = false) {
  return useQuery({
    queryKey: ["seller-questions", sellerId, onlyUnanswered],
    enabled: !!sellerId,
    queryFn: async (): Promise<SellerQuestion[]> => {
      // Fetch questions joined to products owned by this seller
      let q = supabase
        .from("product_questions")
        .select("*, product:seller_products!inner(id, name, slug, primary_image, seller_id)")
        .eq("product.seller_id", sellerId!)
        .order("created_at", { ascending: false });
      if (onlyUnanswered) q = q.is("answer", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as SellerQuestion[];
    },
  });
}

export function useAnswerQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) => {
      const { error } = await supabase
        .from("product_questions")
        .update({ answer: answer.trim() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Risposta pubblicata");
      qc.invalidateQueries({ queryKey: ["seller-questions"] });
      qc.invalidateQueries({ queryKey: ["product-questions"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore risposta"),
  });
}
