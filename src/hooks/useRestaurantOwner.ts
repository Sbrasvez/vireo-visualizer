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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["owned-restaurants", user?.id] });
      qc.invalidateQueries({ queryKey: ["capacity-audit", data.id] });
      toast.success("Capienza per fascia aggiornata");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Errore aggiornamento capienza");
    },
  });
}

export type CapacityAuditEntry = {
  id: string;
  restaurant_id: string;
  changed_by: string | null;
  changed_by_name: string | null;
  old_capacity: number | null;
  new_capacity: number;
  created_at: string;
};

export function useCapacityAudit(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["capacity-audit", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<CapacityAuditEntry[]> => {
      const { data, error } = await supabase
        .from("restaurant_capacity_audit")
        .select("id, restaurant_id, changed_by, old_capacity, new_capacity, created_at")
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const rows = data ?? [];
      const userIds = Array.from(
        new Set(rows.map((r) => r.changed_by).filter((v): v is string => !!v)),
      );
      let nameMap = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        nameMap = new Map(
          (profiles ?? []).map((p) => [p.user_id, p.display_name ?? ""]),
        );
      }
      return rows.map((r) => ({
        ...r,
        changed_by_name: r.changed_by ? nameMap.get(r.changed_by) ?? null : null,
      }));
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
