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
      community_post_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          body: string | null
          comments_count: number
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          recipe_external_id: string | null
          recipe_title: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          recipe_external_id?: string | null
          recipe_title?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          comments_count?: number
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          recipe_external_id?: string | null
          recipe_title?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      magic_bag_reservations: {
        Row: {
          collected_at: string | null
          created_at: string
          id: string
          magic_bag_id: string
          pickup_code: string
          quantity: number
          reserved_at: string
          status: string
          total_price: number
          user_id: string
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          id?: string
          magic_bag_id: string
          pickup_code?: string
          quantity?: number
          reserved_at?: string
          status?: string
          total_price: number
          user_id: string
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          id?: string
          magic_bag_id?: string
          pickup_code?: string
          quantity?: number
          reserved_at?: string
          status?: string
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "magic_bag_reservations_magic_bag_id_fkey"
            columns: ["magic_bag_id"]
            isOneToOne: false
            referencedRelation: "magic_bags"
            referencedColumns: ["id"]
          },
        ]
      }
      magic_bags: {
        Row: {
          category: string
          co2_saved_kg: number
          created_at: string
          description: string | null
          discounted_price: number
          id: string
          image_url: string | null
          is_active: boolean
          original_price: number
          pickup_end: string
          pickup_start: string
          quantity_available: number
          restaurant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          co2_saved_kg?: number
          created_at?: string
          description?: string | null
          discounted_price: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          original_price: number
          pickup_end: string
          pickup_start: string
          quantity_available?: number
          restaurant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          co2_saved_kg?: number
          created_at?: string
          description?: string | null
          discounted_price?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          original_price?: number
          pickup_end?: string
          pickup_start?: string
          quantity_available?: number
          restaurant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "magic_bags_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "magic_bags_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_order_items: {
        Row: {
          commission_rate: number
          created_at: string
          fulfillment_status: string
          id: string
          line_total_cents: number
          order_id: string
          platform_fee_cents: number
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          seller_amount_cents: number
          seller_id: string | null
          tracking_number: string | null
          unit_amount_cents: number
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          fulfillment_status?: string
          id?: string
          line_total_cents: number
          order_id: string
          platform_fee_cents: number
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          seller_amount_cents: number
          seller_id?: string | null
          tracking_number?: string | null
          unit_amount_cents: number
        }
        Update: {
          commission_rate?: number
          created_at?: string
          fulfillment_status?: string
          id?: string
          line_total_cents?: number
          order_id?: string
          platform_fee_cents?: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          seller_amount_cents?: number
          seller_id?: string | null
          tracking_number?: string | null
          unit_amount_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "seller_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_order_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_order_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string
          customer_name: string | null
          environment: string
          id: string
          paid_at: string | null
          platform_fee_cents: number
          sellers_total_cents: number
          shipping_address: Json | null
          shipping_cents: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal_cents: number
          total_cents: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email: string
          customer_name?: string | null
          environment?: string
          id?: string
          paid_at?: string | null
          platform_fee_cents?: number
          sellers_total_cents?: number
          shipping_address?: Json | null
          shipping_cents?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal_cents: number
          total_cents: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string | null
          environment?: string
          id?: string
          paid_at?: string | null
          platform_fee_cents?: number
          sellers_total_cents?: number
          shipping_address?: Json | null
          shipping_cents?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          preferences: Json
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data?: Json
          preferences?: Json
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          preferences?: Json
          updated_at?: string
          user_id?: string
          week_start?: string
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
      product_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          author_name: string
          created_at: string
          id: string
          product_id: string
          question: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          author_name: string
          created_at?: string
          id?: string
          product_id: string
          question: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          author_name?: string
          created_at?: string
          id?: string
          product_id?: string
          question?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_questions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "seller_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          author_name: string
          body: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          body?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "seller_products"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "restaurant_menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "restaurant_photos_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "restaurant_reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "restaurant_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          owner_user_id: string | null
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
          owner_user_id?: string | null
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
          owner_user_id?: string | null
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
      seller_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          replied_at: string | null
          seller_id: string
          sender_email: string
          sender_name: string
          sender_phone: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          replied_at?: string | null
          seller_id: string
          sender_email: string
          sender_name: string
          sender_phone?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          replied_at?: string | null
          seller_id?: string
          sender_email?: string
          sender_name?: string
          sender_phone?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_messages_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_messages_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_products: {
        Row: {
          category: string
          compare_at_price_cents: number | null
          created_at: string
          currency: string
          description: string | null
          external_id: string | null
          id: string
          images: string[]
          is_bio: boolean
          is_published: boolean
          is_reused: boolean
          name: string
          price_cents: number
          primary_image: string | null
          rating: number | null
          reviews_count: number
          sales_count: number
          seller_id: string
          shipping_cents: number
          short_description: string | null
          slug: string
          stock: number
          tags: string[] | null
          unlimited_stock: boolean
          updated_at: string
          views_count: number
          weight_grams: number | null
        }
        Insert: {
          category?: string
          compare_at_price_cents?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          external_id?: string | null
          id?: string
          images?: string[]
          is_bio?: boolean
          is_published?: boolean
          is_reused?: boolean
          name: string
          price_cents: number
          primary_image?: string | null
          rating?: number | null
          reviews_count?: number
          sales_count?: number
          seller_id: string
          shipping_cents?: number
          short_description?: string | null
          slug: string
          stock?: number
          tags?: string[] | null
          unlimited_stock?: boolean
          updated_at?: string
          views_count?: number
          weight_grams?: number | null
        }
        Update: {
          category?: string
          compare_at_price_cents?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          external_id?: string | null
          id?: string
          images?: string[]
          is_bio?: boolean
          is_published?: boolean
          is_reused?: boolean
          name?: string
          price_cents?: number
          primary_image?: string | null
          rating?: number | null
          reviews_count?: number
          sales_count?: number
          seller_id?: string
          shipping_cents?: number
          short_description?: string | null
          slug?: string
          stock?: number
          tags?: string[] | null
          unlimited_stock?: boolean
          updated_at?: string
          views_count?: number
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          business_name: string
          category: string | null
          commission_rate: number
          country: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_demo: boolean
          logo_url: string | null
          phone: string | null
          rating: number | null
          rejection_reason: string | null
          slug: string
          status: Database["public"]["Enums"]["seller_status"]
          stripe_account_id: string | null
          stripe_payouts_enabled: boolean
          total_orders: number
          total_sales_cents: number
          updated_at: string
          user_id: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          business_name: string
          category?: string | null
          commission_rate?: number
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          phone?: string | null
          rating?: number | null
          rejection_reason?: string | null
          slug: string
          status?: Database["public"]["Enums"]["seller_status"]
          stripe_account_id?: string | null
          stripe_payouts_enabled?: boolean
          total_orders?: number
          total_sales_cents?: number
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          business_name?: string
          category?: string | null
          commission_rate?: number
          country?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          phone?: string | null
          rating?: number | null
          rejection_reason?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["seller_status"]
          stripe_account_id?: string | null
          stripe_payouts_enabled?: boolean
          total_orders?: number
          total_sales_cents?: number
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
          website?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          note: string | null
          product_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          note?: string | null
          product_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          note?: string | null
          product_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "seller_products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      restaurants_public: {
        Row: {
          address: string | null
          available_now: boolean | null
          city: string | null
          cover_image: string | null
          created_at: string | null
          cuisine: Database["public"]["Enums"]["cuisine_type"][] | null
          description: string | null
          eco_certifications: string[] | null
          id: string | null
          lat: number | null
          lng: number | null
          name: string | null
          opening_hours: Json | null
          price: Database["public"]["Enums"]["price_range"] | null
          rating: number | null
          region: string | null
          reviews_count: number | null
          short_description: string | null
          slug: string | null
          tags: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          available_now?: boolean | null
          city?: string | null
          cover_image?: string | null
          created_at?: string | null
          cuisine?: Database["public"]["Enums"]["cuisine_type"][] | null
          description?: string | null
          eco_certifications?: string[] | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          opening_hours?: Json | null
          price?: Database["public"]["Enums"]["price_range"] | null
          rating?: number | null
          region?: string | null
          reviews_count?: number | null
          short_description?: string | null
          slug?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          available_now?: boolean | null
          city?: string | null
          cover_image?: string | null
          created_at?: string | null
          cuisine?: Database["public"]["Enums"]["cuisine_type"][] | null
          description?: string | null
          eco_certifications?: string[] | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          opening_hours?: Json | null
          price?: Database["public"]["Enums"]["price_range"] | null
          rating?: number | null
          region?: string | null
          reviews_count?: number | null
          short_description?: string | null
          slug?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      sellers_public: {
        Row: {
          business_name: string | null
          category: string | null
          country: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_demo: boolean | null
          logo_url: string | null
          rating: number | null
          slug: string | null
          status: Database["public"]["Enums"]["seller_status"] | null
          total_orders: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          business_name?: string | null
          category?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_demo?: boolean | null
          logo_url?: string | null
          rating?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["seller_status"] | null
          total_orders?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          business_name?: string | null
          category?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_demo?: boolean | null
          logo_url?: string | null
          rating?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["seller_status"] | null
          total_orders?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      decrement_product_stock: {
        Args: { _id: string; _qty: number }
        Returns: undefined
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_product_views: { Args: { _id: string }; Returns: undefined }
      reserve_magic_bag: {
        Args: { _bag_id: string; _quantity?: number }
        Returns: {
          collected_at: string | null
          created_at: string
          id: string
          magic_bag_id: string
          pickup_code: string
          quantity: number
          reserved_at: string
          status: string
          total_price: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "magic_bag_reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "customer" | "seller" | "admin"
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
      seller_status: "pending" | "approved" | "suspended" | "rejected"
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
      app_role: ["customer", "seller", "admin"],
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
      seller_status: ["pending", "approved", "suspended", "rejected"],
    },
  },
} as const
