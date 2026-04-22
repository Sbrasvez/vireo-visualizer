import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type OwnedRestaurant = {
  id: string;
  name: string;
  slug: string;
  city: string;
  cover_image: string | null;
  slot_capacity: number;
};

export type RestaurantReservation = {
  id: string;
  restaurant_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
};

export function useOwnedRestaurants() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["owned-restaurants", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<OwnedRestaurant[]> => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, slug, city, cover_image, slot_capacity")
        .eq("owner_user_id", user!.id)
        .order("name");
      if (error) throw error;
      return (data ?? []) as OwnedRestaurant[];
    },
  });
}

export function useUpdateRestaurantSlotCapacity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, slot_capacity }: { id: string; slot_capacity: number }) => {
      const { error } = await supabase
        .from("restaurants")
        .update({ slot_capacity })
        .eq("id", id);
      if (error) throw error;
      return { id, slot_capacity };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owned-restaurants", user?.id] });
      toast.success("Capienza per fascia aggiornata");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Errore aggiornamento capienza");
    },
  });
}

export function useRestaurantReservations(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["restaurant-reservations", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<RestaurantReservation[]> => {
      const { data, error } = await supabase
        .from("restaurant_reservations")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("reservation_date", { ascending: false })
        .order("reservation_time", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RestaurantReservation[];
    },
  });
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      restaurant_id,
    }: {
      id: string;
      status: RestaurantReservation["status"];
      restaurant_id: string;
    }) => {
      const { error } = await supabase
        .from("restaurant_reservations")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      return { id, status, restaurant_id };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["restaurant-reservations", data.restaurant_id] });
      toast.success("Prenotazione aggiornata");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Errore aggiornamento prenotazione");
    },
  });
}
