// Centralized pricing & marketplace catalog. Price IDs match Stripe lookup_keys
// created via batch_create_product. Editing this file does NOT change Stripe —
// keep them in sync if you change product names/prices.
import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

export type PlanTierId = "free" | "pro" | "business";

export interface PlanFeature {
  key: string; // i18n key
}

export interface PlanDef {
  id: PlanTierId;
  productId: string | null; // Stripe product id
  priceId: string | null;   // Stripe lookup_key (lovable_external_id)
  amountCents: number;      // monthly
  currency: "eur";
  highlight?: boolean;
  featuresKeys: string[];   // i18n keys under pricing.features.*
}

export const PLANS: PlanDef[] = [
  {
    id: "free",
    productId: null,
    priceId: null,
    amountCents: 0,
    currency: "eur",
    featuresKeys: ["ai_10_day", "save_10", "browse_all", "basic_book"],
  },
  {
    id: "pro",
    productId: "vireo_pro",
    priceId: "vireo_pro_monthly",
    amountCents: 990,
    currency: "eur",
    highlight: true,
    featuresKeys: ["ai_unlimited", "save_unlimited", "priority_book", "pro_badge", "tools_calling"],
  },
  {
    id: "business",
    productId: "vireo_business",
    priceId: "vireo_business_monthly",
    amountCents: 2990,
    currency: "eur",
    featuresKeys: ["all_pro", "analytics", "priority_support", "early_access", "business_badge"],
  },
];

export interface MarketplaceProduct {
  id: number;
  productId: string; // Stripe product id
  priceId: string;   // Stripe lookup_key
  nameKey: string;   // i18n key (optional override) – we use raw name for now
  name: string;
  img: string;
  priceCents: number;
  oldPriceCents?: number;
  seller: string;
  rating: number;
  reviews: number;
  badge?: string;
  reused: boolean;
  category: "kitchen" | "home" | "personal" | "reuse" | "bio";
}

export const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 1,
    productId: "mkt_bamboo_utensils",
    priceId: "mkt_bamboo_utensils_price",
    nameKey: "marketplace.products.bamboo",
    name: "Set utensili in bambù",
    img: p1,
    priceCents: 1890,
    oldPriceCents: 2490,
    seller: "EcoCasa",
    rating: 4.8,
    reviews: 142,
    badge: "Nuovo",
    reused: false,
    category: "kitchen",
  },
  {
    id: 2,
    productId: "mkt_glass_jars",
    priceId: "mkt_glass_jars_price",
    nameKey: "marketplace.products.jars",
    name: "Barattoli vetro riciclato (set 6)",
    img: p2,
    priceCents: 2250,
    seller: "ZeroWaste Co.",
    rating: 4.9,
    reviews: 287,
    badge: "Best seller",
    reused: false,
    category: "kitchen",
  },
  {
    id: 3,
    productId: "mkt_tote_bag",
    priceId: "mkt_tote_bag_price",
    nameKey: "marketplace.products.tote",
    name: "Tote bag cotone organico",
    img: p3,
    priceCents: 1200,
    seller: "Tessuti Etici",
    rating: 4.7,
    reviews: 98,
    reused: false,
    category: "personal",
  },
  {
    id: 4,
    productId: "mkt_beeswax_wraps",
    priceId: "mkt_beeswax_wraps_price",
    nameKey: "marketplace.products.beeswax",
    name: "Beeswax wraps (set 3)",
    img: p4,
    priceCents: 1550,
    seller: "BeeFriendly",
    rating: 4.8,
    reviews: 213,
    badge: "Bio",
    reused: false,
    category: "bio",
  },
  {
    id: 5,
    productId: "mkt_reuse_utensils",
    priceId: "mkt_reuse_utensils_price",
    nameKey: "marketplace.products.reuse_utensils",
    name: "Set utensili (riuso)",
    img: p1,
    priceCents: 990,
    oldPriceCents: 1890,
    seller: "Vireo Reuse",
    rating: 4.6,
    reviews: 54,
    reused: true,
    category: "reuse",
  },
  {
    id: 6,
    productId: "mkt_vintage_jars",
    priceId: "mkt_vintage_jars_price",
    nameKey: "marketplace.products.vintage_jars",
    name: "Barattoli vintage (riuso)",
    img: p2,
    priceCents: 1100,
    seller: "Vireo Reuse",
    rating: 4.5,
    reviews: 32,
    reused: true,
    category: "reuse",
  },
];

export function formatEur(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
