import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MagicBag {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  category: string;
  original_price: number;
  discounted_price: number;
  quantity_available: number;
  pickup_start: string;
  pickup_end: string;
  image_url: string | null;
  co2_saved_kg: number;
  is_active: boolean;
  restaurant?: {
    name: string;
    city: string;
    address: string;
    cover_image: string | null;
    slug: string;
  };
}

export function useMagicBags() {
  return useQuery({
    queryKey: ["magic-bags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("magic_bags")
        .select(
          `*, restaurant:restaurants(name, city, address, cover_image, slug)`
        )
        .eq("is_active", true)
        .gt("quantity_available", 0)
        .gte("pickup_end", new Date().toISOString())
        .order("pickup_start", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MagicBag[];
    },
  });
}

export function useMyBagReservations() {
  return useQuery({
    queryKey: ["my-bag-reservations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("magic_bag_reservations")
        .select(`*, magic_bag:magic_bags(*, restaurant:restaurants(name, city, address))`)
        .eq("user_id", user.id)
        .order("reserved_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useReserveMagicBag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bagId, quantity = 1 }: { bagId: string; quantity?: number }) => {
      const { data, error } = await supabase.rpc("reserve_magic_bag", {
        _bag_id: bagId,
        _quantity: quantity,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      toast.success(`Magic Bag riservata! Codice: ${data?.pickup_code ?? "—"}`);
      qc.invalidateQueries({ queryKey: ["magic-bags"] });
      qc.invalidateQueries({ queryKey: ["my-bag-reservations"] });
      qc.invalidateQueries({ queryKey: ["co2-stats"] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Errore nella prenotazione");
    },
  });
}
