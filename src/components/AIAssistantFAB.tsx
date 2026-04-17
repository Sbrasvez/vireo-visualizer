import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const HIDDEN_ROUTES = ["/ai", "/login", "/signup", "/forgot-password", "/reset-password"];

export function AIAssistantFAB() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (loading || !user) return null;
  if (HIDDEN_ROUTES.some((r) => location.pathname === r || location.pathname.startsWith(`${r}/`))) {
    return null;
  }

  const label = t("ai.fab_tooltip", "Chiedi a Vireo AI");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/ai"
          aria-label={label}
          className={cn(
            "fixed z-40 bottom-4 right-4 sm:bottom-6 sm:right-6",
            "flex items-center justify-center size-12 rounded-full",
            "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground",
            "shadow-lg shadow-primary/30 ring-1 ring-primary/20",
            "transition-transform duration-200 hover:scale-110 active:scale-95",
            "animate-in fade-in zoom-in-75 duration-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingRight: "env(safe-area-inset-right)",
          }}
        >
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-30" aria-hidden />
          <Sparkles className="size-5 relative" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="left" className="font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
