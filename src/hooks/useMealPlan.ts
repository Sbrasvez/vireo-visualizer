import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MealPlanDay {
  day: string;
  meals: { breakfast: string; lunch: string; dinner: string };
  estimated_calories: number;
  ingredients: string[];
}

export interface MealPlanData {
  days: MealPlanDay[];
  shopping_list: string[];
  eco_score: number;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start: string;
  preferences: any;
  plan_data: MealPlanData;
  created_at: string;
  updated_at: string;
}

function getMonday(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().slice(0, 10);
}

export function useCurrentMealPlan() {
  return useQuery({
    queryKey: ["meal-plan-current"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const weekStart = getMonday();
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .maybeSingle();
      if (error) throw error;
      return data as MealPlan | null;
    },
  });
}

export function useGenerateMealPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: {
      diet?: string;
      calories?: number;
      allergies?: string[];
      servings?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-meal-plan",
        { body: { ...preferences, weekStart: getMonday() } },
      );
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data.plan as MealPlan;
    },
    onSuccess: () => {
      toast.success("Piano settimanale generato!");
      qc.invalidateQueries({ queryKey: ["meal-plan-current"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore generazione piano"),
  });
}

export { getMonday };
