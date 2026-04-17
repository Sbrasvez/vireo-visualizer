import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePlan, type PlanTier } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";

interface Props {
  requiredPlan: Exclude<PlanTier, "free">;
  children: ReactNode;
  /** When false: still renders children but visually locked + intercepts clicks */
  block?: boolean;
  fallback?: ReactNode;
}

const order: Record<PlanTier, number> = { free: 0, pro: 1, business: 2 };

export function FeatureGate({ requiredPlan, children, block = true, fallback }: Props) {
  const { t } = useTranslation();
  const { plan } = usePlan();
  const tier = plan?.tier ?? "free";
  const allowed = order[tier] >= order[requiredPlan];

  if (allowed) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  if (!block) {
    return (
      <div className="relative opacity-60 pointer-events-none select-none">
        {children}
        <div className="absolute inset-0 grid place-items-center">
          <span className="bg-background/90 backdrop-blur rounded-lg px-2 py-1 text-xs font-medium flex items-center gap-1">
            <Lock className="size-3" /> {t("feature_gate.locked")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-tertiary/5 p-6 text-center space-y-3">
      <div className="size-12 mx-auto rounded-2xl bg-primary text-primary-foreground grid place-items-center">
        <Crown className="size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold">
          {t("feature_gate.title", { plan: requiredPlan })}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {t("feature_gate.desc")}
        </p>
      </div>
      <Button asChild size="sm">
        <Link to="/pricing">{t("feature_gate.upgrade")}</Link>
      </Button>
    </div>
  );
}
