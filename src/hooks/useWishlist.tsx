import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { SellerProduct } from "./useSellerProducts";

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  note: string | null;
  is_public: boolean;
  created_at: string;
  product?: SellerProduct & { seller?: { id: string; business_name: string; slug: string } };
}

const PRODUCT_SELECT = `
  id, name, slug, primary_image, images, price_cents, compare_at_price_cents,
  rating, reviews_count, stock, unlimited_stock, is_bio, is_reused, shipping_cents,
  seller_id,
  seller:sellers ( id, business_name, slug )
`;

/**
 * IDs of products in the current user's wishlist (lightweight).
 * Used by Marketplace cards / ProductDetail to render the active state.
 */
export function useWishlistIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist-ids", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.product_id));
    },
  });
}

/**
 * Full wishlist of the authenticated user, with joined product + seller info.
 */
export function useMyWishlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wishlist-mine", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<WishlistItem[]> => {
      const { data, error } = await supabase
        .from("wishlists")
        .select(`id, user_id, product_id, note, is_public, created_at, product:seller_products ( ${PRODUCT_SELECT} )`)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as WishlistItem[];
    },
  });
}

/**
 * Public wishlist for a given userId. Only rows with is_public = true are
 * returned (enforced by RLS).
 */
export function usePublicWishlist(userId: string | undefined) {
  return useQuery({
    queryKey: ["wishlist-public", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [items, profile] = await Promise.all([
        supabase
          .from("wishlists")
          .select(`id, user_id, product_id, note, is_public, created_at, product:seller_products ( ${PRODUCT_SELECT} )`)
          .eq("user_id", userId!)
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", userId!)
          .maybeSingle(),
      ]);
      if (items.error) throw items.error;
      return {
        items: (items.data ?? []) as unknown as WishlistItem[],
        owner: profile.data ?? null,
      };
    },
  });
}

export function useToggleWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      productId,
      currentlyIn,
    }: {
      productId: string;
      currentlyIn: boolean;
    }) => {
      if (!user) throw new Error("not_authenticated");
      if (currentlyIn) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
        return { added: false };
      }
      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
      return { added: true };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["wishlist-ids", user?.id] });
      qc.invalidateQueries({ queryKey: ["wishlist-mine", user?.id] });
      toast.success(
        res.added ? t("wishlist.added", "Aggiunto ai preferiti") : t("wishlist.removed", "Rimosso dai preferiti"),
      );
    },
    onError: (err: Error) => {
      if (err.message === "not_authenticated") {
        toast.error(t("wishlist.login_required", "Accedi per usare la wishlist"));
      } else {
        toast.error(t("common.error", "Errore"));
      }
    },
  });
}

export function useUpdateWishlistItem() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<WishlistItem, "is_public" | "note">>;
    }) => {
      const { error } = await supabase.from("wishlists").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist-mine", user?.id] });
    },
    onError: () => {
      toast.error(t("common.error", "Errore"));
    },
  });
}

export function useBulkSetWishlistVisibility() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (isPublic: boolean) => {
      if (!user) throw new Error("not_authenticated");
      const { error } = await supabase
        .from("wishlists")
        .update({ is_public: isPublic })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_data, isPublic) => {
      qc.invalidateQueries({ queryKey: ["wishlist-mine", user?.id] });
      toast.success(
        isPublic
          ? t("wishlist.all_public", "Wishlist resa pubblica")
          : t("wishlist.all_private", "Wishlist resa privata"),
      );
    },
  });
}
