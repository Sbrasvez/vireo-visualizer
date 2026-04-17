import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Seller {
  id: string;
  user_id: string | null;
  slug: string;
  business_name: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  email: string | null;
  phone: string | null;
  vat_number: string | null;
  country: string | null;
  category: string | null;
  website: string | null;
  status: "pending" | "approved" | "suspended" | "rejected";
  commission_rate: number;
  stripe_account_id: string | null;
  stripe_payouts_enabled: boolean;
  approved_at: string | null;
  rejection_reason: string | null;
  total_sales_cents: number;
  total_orders: number;
  rating: number | null;
  is_demo: boolean;
  created_at: string;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function useMySeller() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-seller", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Seller | null> => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as Seller) ?? null;
    },
  });
}

export function useSellerBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["seller-by-slug", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Seller | null> => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "approved")
        .maybeSingle();
      if (error) throw error;
      return (data as Seller) ?? null;
    },
  });
}

export function useApprovedSellers() {
  return useQuery({
    queryKey: ["approved-sellers"],
    queryFn: async (): Promise<Seller[]> => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("status", "approved")
        .order("total_sales_cents", { ascending: false });
      if (error) throw error;
      return (data as Seller[]) ?? [];
    },
  });
}

export function usePendingSellers() {
  return useQuery({
    queryKey: ["pending-sellers"],
    queryFn: async (): Promise<Seller[]> => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .in("status", ["pending", "rejected", "suspended"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Seller[]) ?? [];
    },
  });
}

export function useApplyAsSeller() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: {
      business_name: string;
      description?: string;
      email?: string;
      phone?: string;
      vat_number?: string;
      website?: string;
      category?: string;
    }) => {
      if (!user) throw new Error("Devi accedere per candidarti");
      const baseSlug = slugify(payload.business_name);
      const slug = `${baseSlug}-${user.id.slice(0, 6)}`;
      const { data, error } = await supabase
        .from("sellers")
        .insert({
          user_id: user.id,
          slug,
          business_name: payload.business_name,
          description: payload.description ?? null,
          email: payload.email ?? user.email ?? null,
          phone: payload.phone ?? null,
          vat_number: payload.vat_number ?? null,
          website: payload.website ?? null,
          category: payload.category ?? null,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return data as Seller;
    },
    onSuccess: () => {
      toast.success("Domanda inviata! Riceverai una risposta entro 48h.");
      qc.invalidateQueries({ queryKey: ["my-seller"] });
      qc.invalidateQueries({ queryKey: ["pending-sellers"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore invio domanda"),
  });
}

export function useReviewSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sellerId,
      decision,
      reason,
    }: {
      sellerId: string;
      decision: "approved" | "rejected" | "suspended";
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("sellers")
        .update({
          status: decision,
          rejection_reason: decision === "rejected" ? reason ?? null : null,
        })
        .eq("id", sellerId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(
        vars.decision === "approved"
          ? "Venditore approvato"
          : vars.decision === "rejected"
            ? "Domanda rifiutata"
            : "Venditore sospeso",
      );
      qc.invalidateQueries({ queryKey: ["pending-sellers"] });
      qc.invalidateQueries({ queryKey: ["approved-sellers"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}

export function useUpdateMySeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Seller>) => {
      const { data: s } = await supabase.from("sellers").select("id").eq("user_id", (await supabase.auth.getUser()).data.user!.id).maybeSingle();
      if (!s) throw new Error("Profilo venditore non trovato");
      const { error } = await supabase.from("sellers").update(patch).eq("id", s.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profilo aggiornato");
      qc.invalidateQueries({ queryKey: ["my-seller"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}
