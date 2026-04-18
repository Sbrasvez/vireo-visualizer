import { useTranslation } from "react-i18next";
import { ShoppingCart, Trash2, Share2, ChefHat, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import EditorialPageHeader from "@/components/EditorialPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useShoppingList } from "@/hooks/useShoppingList";
import { toast } from "sonner";

export default function ShoppingList() {
  const { t } = useTranslation();
  const { items, groupedByCategory, toggleCheck, removeItem, clearChecked, clearAll, uncheckedCount } =
    useShoppingList();

  const handleShare = async () => {
    const text = items
      .map((it) => {
        const qty = it.amount ? `${Math.round(it.amount * 100) / 100}${it.unit ? " " + it.unit : ""} ` : "";
        return `${it.checked ? "✓" : "·"} ${qty}${it.name}`;
      })
      .join("\n");
    const full = `🛒 ${t("shopping_list.title")} — Vireo\n\n${text}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: t("shopping_list.title"), text: full });
      } else {
        await navigator.clipboard.writeText(full);
        toast.success(t("shopping_list.copied"));
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-3xl py-8 space-y-6">
        <EditorialPageHeader
          surface="plain"
          containerClassName="max-w-none px-0"
          eyebrow={t("shopping_list.eyebrow", "Spesa consapevole")}
          number="08"
          title={t("shopping_list.title_1", "La tua")}
          italic={t("shopping_list.title_em", "lista")}
          trailing={t("shopping_list.title_2", "essenziale.")}
          lead={t("shopping_list.subtitle", { count: uncheckedCount })}
          aside={
            items.length > 0 ? (
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="size-4 mr-1.5" /> {t("shopping_list.share")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChecked}
                  disabled={items.every((i) => !i.checked)}
                >
                  {t("shopping_list.clear_checked")}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="size-4 mr-1.5" /> {t("shopping_list.clear_all")}
                </Button>
              </div>
            ) : undefined
          }
        />

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="mx-auto size-16 rounded-2xl bg-accent grid place-items-center">
                <ShoppingCart className="size-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold mb-1">
                  {t("shopping_list.empty_title")}
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {t("shopping_list.empty_desc")}
                </p>
              </div>
              <Button asChild>
                <Link to="/recipes">
                  <ChefHat className="size-4 mr-1.5" />
                  {t("shopping_list.browse_recipes")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {Object.entries(groupedByCategory).map(([cat, list]) => (
              <Card key={cat}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="size-3.5 text-primary" />
                    {t(`shopping_list.${cat}`, { defaultValue: cat })}
                    <Badge variant="secondary" className="text-[10px] ml-1">
                      {list.length}
                    </Badge>
                  </h3>
                  <ul className="space-y-1.5">
                    {list.map((it) => (
                      <li
                        key={it.id}
                        className={`flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-md hover:bg-accent/50 transition group ${
                          it.checked ? "opacity-50" : ""
                        }`}
                      >
                        <Checkbox
                          checked={it.checked}
                          onCheckedChange={() => toggleCheck(it.id)}
                          aria-label={it.name}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm ${it.checked ? "line-through" : ""}`}>
                            {it.amount && (
                              <span className="font-semibold text-primary mr-1.5">
                                {Math.round(it.amount * 100) / 100}
                                {it.unit ? ` ${it.unit}` : ""}
                              </span>
                            )}
                            <span className="capitalize">{it.name}</span>
                          </div>
                          {it.recipeTitle && (
                            <div className="text-[10px] text-muted-foreground truncate">
                              {t("shopping_list.from")} {it.recipeTitle}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(it.id)}
                          className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive p-1"
                          aria-label={t("common.cancel")}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
