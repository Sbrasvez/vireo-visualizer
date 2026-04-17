import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const HIDDEN_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

export default function BackButtonFAB() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  if (HIDDEN_ROUTES.includes(location.pathname)) return null;

  const label = t("nav.back", "Indietro");
  const canGoBack = window.history.length > 1;

  const handleClick = (e: React.MouseEvent) => {
    if (canGoBack) {
      e.preventDefault();
      navigate(-1);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/"
          onClick={handleClick}
          aria-label={label}
          className={cn(
            "fixed z-40 bottom-4 left-4 sm:bottom-6 sm:left-6",
            "flex items-center justify-center size-10 rounded-full",
            "bg-background/80 backdrop-blur-md text-foreground",
            "border border-border/60 shadow-md",
            "transition-all duration-200 hover:scale-110 hover:bg-background active:scale-95",
            "animate-in fade-in zoom-in-75 duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingLeft: "env(safe-area-inset-left)",
          }}
        >
          <ArrowLeft className="size-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
