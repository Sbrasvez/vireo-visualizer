import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";

export interface ShoppingItem {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  category: string;
  recipeId?: string;
  recipeTitle?: string;
  checked: boolean;
  addedAt: string;
}

interface ShoppingListContextValue {
  items: ShoppingItem[];
  addItems: (items: Omit<ShoppingItem, "id" | "checked" | "addedAt">[]) => void;
  removeItem: (id: string) => void;
  toggleCheck: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
  uncheckedCount: number;
  groupedByCategory: Record<string, ShoppingItem[]>;
}

const ShoppingListContext = createContext<ShoppingListContextValue | undefined>(undefined);
const STORAGE_KEY = "vireo:shopping_list";

// Heuristic categorization (Italian + English keywords)
function categorize(name: string): string {
  const n = name.toLowerCase();
  if (/(pomodor|cipoll|aglio|carot|zucchin|melanzan|peperon|insalat|spinac|rucol|cavol|broccol|funghi|patat|sedano|cetriol|lettuce|tomato|onion|garlic|pepper|mushroom|carrot|spinach|salad)/.test(n))
    return "categories.vegetables";
  if (/(mela|pera|banan|aranc|limon|frutt|fragol|uva|kiwi|ananas|pesc|albicocch|cilieg|melon|anguri|apple|banana|orange|berry|fruit|lemon|peach)/.test(n))
    return "categories.fruits";
  if (/(pasta|riso|farin|pane|cereal|avena|farro|orzo|quinoa|cuscus|polenta|gnocch|tortill|rice|flour|bread|oat|grain)/.test(n))
    return "categories.grains";
  if (/(fagiol|cec|lentic|piselli|soia|tofu|tempeh|seitan|edamame|bean|chickpea|lentil|pea|legume)/.test(n))
    return "categories.legumes";
  if (/(latte|yogurt|formagg|burro|panna|ricott|mozzarell|parmigian|milk|cheese|butter|cream|yogurt)/.test(n))
    return "categories.dairy";
  if (/(noci|mandorl|nocciol|pinol|sesam|chia|lin|girasol|zucca|nut|almond|seed|pumpkin)/.test(n))
    return "categories.nuts_seeds";
  if (/(olio|aceto|sale|pepe|spez|erb|basilic|prezzemol|origan|rosmarin|salvi|tim|curry|paprika|cumin|cannell|oil|vinegar|salt|spice|herb|basil|parsley|oregano|rosemary|sage|thyme)/.test(n))
    return "categories.condiments";
  if (/(zuccher|miel|sciropp|cioccolat|cacao|vaniglia|sugar|honey|chocolate|cocoa|vanilla)/.test(n))
    return "categories.sweeteners";
  if (/(acqu|succ|tè|caff|tisan|water|juice|tea|coffee)/.test(n))
    return "categories.drinks";
  return "categories.other";
}

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ShoppingItem[]) : [];
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

  const addItems = useCallback<ShoppingListContextValue["addItems"]>((newItems) => {
    setItems((prev) => {
      const copy = [...prev];
      for (const it of newItems) {
        const key = `${it.name.toLowerCase().trim()}|${it.unit || ""}|${it.recipeId || ""}`;
        const existingIdx = copy.findIndex(
          (p) => `${p.name.toLowerCase().trim()}|${p.unit || ""}|${p.recipeId || ""}` === key,
        );
        if (existingIdx >= 0 && it.amount && copy[existingIdx].amount) {
          copy[existingIdx] = { ...copy[existingIdx], amount: (copy[existingIdx].amount || 0) + it.amount };
        } else if (existingIdx < 0) {
          copy.push({
            ...it,
            category: it.category || categorize(it.name),
            id: crypto.randomUUID(),
            checked: false,
            addedAt: new Date().toISOString(),
          });
        }
      }
      return copy;
    });
  }, []);

  const removeItem = useCallback<ShoppingListContextValue["removeItem"]>((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleCheck = useCallback<ShoppingListContextValue["toggleCheck"]>((id) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)));
  }, []);

  const clearChecked = useCallback(() => setItems((prev) => prev.filter((p) => !p.checked)), []);
  const clearAll = useCallback(() => setItems([]), []);

  const value = useMemo<ShoppingListContextValue>(() => {
    const uncheckedCount = items.filter((i) => !i.checked).length;
    const groupedByCategory = items.reduce<Record<string, ShoppingItem[]>>((acc, it) => {
      (acc[it.category] = acc[it.category] || []).push(it);
      return acc;
    }, {});
    return { items, addItems, removeItem, toggleCheck, clearChecked, clearAll, uncheckedCount, groupedByCategory };
  }, [items, addItems, removeItem, toggleCheck, clearChecked, clearAll]);

  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
}

export function useShoppingList() {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error("useShoppingList must be used within ShoppingListProvider");
  return ctx;
}

export { categorize };
