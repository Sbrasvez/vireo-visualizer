import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SellerProduct {
  id: string;
  seller_id: string;
  slug: string;
  external_id: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  category: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  images: string[];
  primary_image: string | null;
  stock: number;
  unlimited_stock: boolean;
  is_published: boolean;
  is_reused: boolean;
  is_bio: boolean;
  tags: string[] | null;
  shipping_cents: number;
  views_count: number;
  sales_count: number;
  rating: number | null;
  reviews_count: number;
  created_at: string;
  seller?: {
    id: string;
    business_name: string;
    slug: string;
    logo_url: string | null;
    rating: number | null;
  };
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

export interface ProductFilters {
  category?: string;
  search?: string;
  reusedOnly?: boolean;
  sellerId?: string;
}

export function useMarketplaceProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["marketplace-products", filters],
    queryFn: async (): Promise<SellerProduct[]> => {
      let q = supabase
        .from("seller_products")
        .select("*, seller:sellers!inner(id, business_name, slug, logo_url, rating, status)")
        .eq("is_published", true)
        .eq("seller.status", "approved");

      if (filters.category && filters.category !== "all") q = q.eq("category", filters.category);
      if (filters.reusedOnly) q = q.eq("is_reused", true);
      if (filters.sellerId) q = q.eq("seller_id", filters.sellerId);
      if (filters.search) q = q.ilike("name", `%${filters.search}%`);

      const { data, error } = await q.order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as SellerProduct[];
    },
  });
}

export function useMyProducts(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["my-products", sellerId],
    enabled: !!sellerId,
    queryFn: async (): Promise<SellerProduct[]> => {
      const { data, error } = await supabase
        .from("seller_products")
        .select("*")
        .eq("seller_id", sellerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SellerProduct[];
    },
  });
}

export interface ProductInput {
  name: string;
  description?: string;
  category: string;
  price_cents: number;
  compare_at_price_cents?: number | null;
  stock?: number;
  unlimited_stock?: boolean;
  images?: string[];
  is_reused?: boolean;
  is_bio?: boolean;
  tags?: string[];
  is_published?: boolean;
  shipping_cents?: number;
}

export function useCreateProduct(sellerId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProductInput) => {
      if (!sellerId) throw new Error("Profilo venditore mancante");
      const slug = `${slugify(payload.name)}-${crypto.randomUUID().slice(0, 6)}`;
      const { error } = await supabase.from("seller_products").insert({
        seller_id: sellerId,
        slug,
        name: payload.name,
        description: payload.description ?? null,
        category: payload.category,
        price_cents: payload.price_cents,
        compare_at_price_cents: payload.compare_at_price_cents ?? null,
        stock: payload.stock ?? 0,
        unlimited_stock: payload.unlimited_stock ?? false,
        images: payload.images ?? [],
        primary_image: payload.images?.[0] ?? null,
        is_reused: payload.is_reused ?? false,
        is_bio: payload.is_bio ?? false,
        tags: payload.tags ?? [],
        is_published: payload.is_published ?? true,
        shipping_cents: payload.shipping_cents ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Prodotto pubblicato");
      qc.invalidateQueries({ queryKey: ["my-products"] });
      qc.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Omit<SellerProduct, "seller">> }) => {
      const { error } = await supabase.from("seller_products").update(patch as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-products"] });
      qc.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("seller_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Prodotto eliminato");
      qc.invalidateQueries({ queryKey: ["my-products"] });
      qc.invalidateQueries({ queryKey: ["marketplace-products"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}
