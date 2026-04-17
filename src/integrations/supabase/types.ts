export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      co2_log: {
        Row: {
          action: string
          created_at: string
          id: string
          kg_co2: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          kg_co2?: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          kg_co2?: number
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_amount: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price_id: string
          product_id: string
          product_name: string
          quantity?: number
          unit_amount: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_total: number
          created_at: string | null
          currency: string
          customer_email: string
          environment: string
          id: string
          shipping_address: Json | null
          shipping_name: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_total: number
          created_at?: string | null
          currency?: string
          customer_email: string
          environment?: string
          id?: string
          shipping_address?: Json | null
          shipping_name?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_total?: number
          created_at?: string | null
          currency?: string
          customer_email?: string
          environment?: string
          id?: string
          shipping_address?: Json | null
          shipping_name?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string
          cuisines: string[] | null
          diets: string[] | null
          difficulty: Database["public"]["Enums"]["recipe_difficulty"]
          dish_types: string[] | null
          eco_score: number | null
          external_id: string | null
          id: string
          image: string | null
          ingredients: Json
          instructions: Json
          nutrition: Json | null
          ready_in_minutes: number | null
          servings: number | null
          slug: string
          source: string
          source_url: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cuisines?: string[] | null
          diets?: string[] | null
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"]
          dish_types?: string[] | null
          eco_score?: number | null
          external_id?: string | null
          id?: string
          image?: string | null
          ingredients?: Json
          instructions?: Json
          nutrition?: Json | null
          ready_in_minutes?: number | null
          servings?: number | null
          slug: string
          source?: string
          source_url?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cuisines?: string[] | null
          diets?: string[] | null
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"]
          dish_types?: string[] | null
          eco_score?: number | null
          external_id?: string | null
          id?: string
          image?: string | null
          ingredients?: Json
          instructions?: Json
          nutrition?: Json | null
          ready_in_minutes?: number | null
          servings?: number | null
          slug?: string
          source?: string
          source_url?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_menu_items: {
        Row: {
          allergens: string[] | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_vegan: boolean | null
          name: string
          price: number | null
          restaurant_id: string
          sort_order: number | null
        }
        Insert: {
          allergens?: string[] | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_vegan?: boolean | null
          name: string
          price?: number | null
          restaurant_id: string
          sort_order?: number | null
        }
        Update: {
          allergens?: string[] | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_vegan?: boolean | null
          name?: string
          price?: number | null
          restaurant_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          restaurant_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          restaurant_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          restaurant_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_photos_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_reservations: {
        Row: {
          created_at: string
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          notes: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          restaurant_id?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_reviews: {
        Row: {
          author_name: string
          body: string | null
          created_at: string
          id: string
          rating: number
          restaurant_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          body?: string | null
          created_at?: string
          id?: string
          rating: number
          restaurant_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string | null
          created_at?: string
          id?: string
          rating?: number
          restaurant_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          available_now: boolean
          city: string
          cover_image: string | null
          created_at: string
          cuisine: Database["public"]["Enums"]["cuisine_type"][]
          description: string | null
          eco_certifications: string[] | null
          email: string | null
          id: string
          lat: number
          lng: number
          name: string
          opening_hours: Json | null
          phone: string | null
          price: Database["public"]["Enums"]["price_range"]
          rating: number | null
          region: string | null
          reviews_count: number | null
          short_description: string | null
          slug: string
          tags: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          available_now?: boolean
          city: string
          cover_image?: string | null
          created_at?: string
          cuisine?: Database["public"]["Enums"]["cuisine_type"][]
          description?: string | null
          eco_certifications?: string[] | null
          email?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          opening_hours?: Json | null
          phone?: string | null
          price?: Database["public"]["Enums"]["price_range"]
          rating?: number | null
          region?: string | null
          reviews_count?: number | null
          short_description?: string | null
          slug: string
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          available_now?: boolean
          city?: string
          cover_image?: string | null
          created_at?: string
          cuisine?: Database["public"]["Enums"]["cuisine_type"][]
          description?: string | null
          eco_certifications?: string[] | null
          email?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          price?: Database["public"]["Enums"]["price_range"]
          rating?: number | null
          region?: string | null
          reviews_count?: number | null
          short_description?: string | null
          slug?: string
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          created_at: string
          diets: string[] | null
          external_id: string
          id: string
          image_url: string | null
          ready_in_minutes: number | null
          source: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diets?: string[] | null
          external_id: string
          id?: string
          image_url?: string | null
          ready_in_minutes?: number | null
          source?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          diets?: string[] | null
          external_id?: string
          id?: string
          image_url?: string | null
          ready_in_minutes?: number | null
          source?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          ai_messages_reset_at: string
          ai_messages_today: number
          created_at: string
          id: string
          plan_expires_at: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_messages_reset_at?: string
          ai_messages_today?: number
          created_at?: string
          id?: string
          plan_expires_at?: string | null
          tier?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_messages_reset_at?: string
          ai_messages_today?: number
          created_at?: string
          id?: string
          plan_expires_at?: string | null
          tier?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      cuisine_type:
        | "vegano"
        | "vegetariano"
        | "plant_based"
        | "bio"
        | "mediterraneo"
        | "crudista"
        | "fusion"
        | "km_zero"
      plan_tier: "free" | "pro" | "business"
      price_range: "€" | "€€" | "€€€" | "€€€€"
      recipe_difficulty: "facile" | "media" | "difficile"
      reservation_status: "pending" | "confirmed" | "cancelled" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cuisine_type: [
        "vegano",
        "vegetariano",
        "plant_based",
        "bio",
        "mediterraneo",
        "crudista",
        "fusion",
        "km_zero",
      ],
      plan_tier: ["free", "pro", "business"],
      price_range: ["€", "€€", "€€€", "€€€€"],
      recipe_difficulty: ["facile", "media", "difficile"],
      reservation_status: ["pending", "confirmed", "cancelled", "completed"],
    },
  },
} as const
