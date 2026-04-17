import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistIds, useToggleWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "full";
  className?: string;
}

/**
 * Toggle a product's wishlist state.
 *
 * - `icon`: floating circle (use over product images / cards)
 * - `full`: full button with label (use next to "Add to cart")
 */
export function WishlistButton({ productId, variant = "icon", className }: WishlistButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ids } = useWishlistIds();
  const toggle = useToggleWishlist();

  const isIn = ids?.has(productId) ?? false;

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    toggle.mutate({ productId, currentlyIn: isIn });
  };

  const label = isIn
    ? t("wishlist.remove_aria", "Rimuovi dai preferiti")
    : t("wishlist.add_aria", "Aggiungi ai preferiti");

  if (variant === "full") {
    return (
      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={handle}
        disabled={toggle.isPending}
        className={cn("gap-2", className)}
        aria-pressed={isIn}
        aria-label={label}
      >
        <Heart
          className={cn(
            "size-5 transition-colors",
            isIn ? "fill-secondary text-secondary" : "text-muted-foreground",
          )}
        />
        <span className="hidden sm:inline">
          {isIn ? t("wishlist.in_list", "Nei preferiti") : t("wishlist.add", "Aggiungi ai preferiti")}
        </span>
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={toggle.isPending}
      aria-pressed={isIn}
      aria-label={label}
      className={cn(
        "size-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center shadow-soft transition-colors",
        isIn ? "text-secondary" : "text-muted-foreground hover:text-secondary",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-all", isIn && "fill-secondary")} />
    </button>
  );
}
