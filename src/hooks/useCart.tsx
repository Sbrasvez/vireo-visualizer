import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface CartItem {
  // For seller products: productId is the seller_products UUID; priceId mirrors it.
  // For Stripe-priced items (subscriptions): priceId is the Stripe lookup_key.
  priceId: string;
  productId: string;
  name: string;
  image: string;
  unitAmount: number; // cents
  quantity: number;
  sellerId?: string;
  sellerName?: string;
  shippingCents?: number;
  // Marks this line as a dynamic seller product so checkout uses price_data
  kind?: "seller_product" | "stripe_price";
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (priceId: string) => void;
  setQuantity: (priceId: string, qty: number) => void;
  clear: () => void;
  count: number;
  totalCents: number;
  shippingCents: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "vireo:cart:v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((p) => p.priceId === item.priceId);
        if (existing) {
          return prev.map((p) =>
            p.priceId === item.priceId ? { ...p, quantity: p.quantity + qty } : p,
          );
        }
        return [...prev, { ...item, quantity: qty }];
      });
    };
    const removeItem: CartContextValue["removeItem"] = (priceId) =>
      setItems((prev) => prev.filter((p) => p.priceId !== priceId));
    const setQuantity: CartContextValue["setQuantity"] = (priceId, qty) =>
      setItems((prev) =>
        prev
          .map((p) => (p.priceId === priceId ? { ...p, quantity: Math.max(0, qty) } : p))
          .filter((p) => p.quantity > 0),
      );
    const clear: CartContextValue["clear"] = () => setItems([]);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const totalCents = items.reduce((s, i) => s + i.unitAmount * i.quantity, 0);
    // Shipping: max shipping_cents across distinct sellers in cart
    const sellerShip = new Map<string, number>();
    for (const i of items) {
      if (i.sellerId && (i.shippingCents ?? 0) > 0) {
        sellerShip.set(i.sellerId, Math.max(sellerShip.get(i.sellerId) ?? 0, i.shippingCents!));
      }
    }
    const shippingCents = Array.from(sellerShip.values()).reduce((s, n) => s + n, 0);
    return { items, addItem, removeItem, setQuantity, clear, count, totalCents, shippingCents };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
