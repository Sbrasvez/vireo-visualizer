import { AlertCircle, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
import type { CookieCategories } from "@/hooks/useCookieConsent";

/**
 * Stato unificato del consenso cookie usato in tutta l'app
 * (badge "Ultimo aggiornamento" su /cookies, pannello sticky, banner globale).
 *
 * Priorità: dirty > just-updated > saved > none.
 */
export type CookieStatusKey = "dirty" | "just-updated" | "saved" | "none";

export type CookieStatusStyle = {
  Icon: LucideIcon;
  /** Colore testo + icona (semantic token). */
  tone: string;
  /** Sfondo del contenitore. */
  surface: string;
  /** Bordo del contenitore. */
  border: string;
  /** Classi extra applicate all'icona (es. animazioni). */
  iconClass?: string;
};

export const cookieStatusStyles: Record<CookieStatusKey, CookieStatusStyle> = {
  dirty: {
    Icon: AlertCircle,
    tone: "text-primary",
    surface: "bg-primary/10",
    border: "border-primary/50",
  },
  "just-updated": {
    Icon: CheckCircle2,
    tone: "text-primary",
    surface: "bg-primary/10",
    border: "border-primary",
    iconClass: "animate-in zoom-in-50",
  },
  saved: {
    Icon: CheckCircle2,
    tone: "text-muted-foreground",
    surface: "bg-muted/40",
    border: "border-border",
  },
  none: {
    Icon: Clock,
    tone: "text-muted-foreground",
    surface: "bg-muted/40",
    border: "border-border",
  },
};

export function resolveCookieStatus(params: {
  isDirty: boolean;
  justUpdated: boolean;
  consent: CookieCategories | null;
}): CookieStatusKey {
  const { isDirty, justUpdated, consent } = params;
  if (isDirty) return "dirty";
  if (justUpdated) return "just-updated";
  if (consent) return "saved";
  return "none";
}
