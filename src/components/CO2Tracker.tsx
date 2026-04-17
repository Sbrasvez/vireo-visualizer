import { useTranslation } from "react-i18next";
import { Leaf, Car, Plane, Info } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCO2 } from "@/hooks/useCO2";

export function CO2Tracker() {
  const { t, i18n } = useTranslation();
  const { totalKg, weekKg, daily, loading } = useCO2();

  // Equivalents: 1 km in car ≈ 0.12 kg CO2; 1 short flight (Roma-Milano) ≈ 60 kg
  const kmInCar = Math.round(totalKg / 0.12);
  const flights = (totalKg / 60).toFixed(1);

  const dayLabel = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(i18n.language, { weekday: "short" });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="size-4 text-primary" />
              {t("co2.title")}
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-primary mt-1">
              {totalKg} kg
              <span className="text-sm text-muted-foreground font-normal ml-2">
                {t("co2.saved")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("co2.this_week", { kg: weekKg })}
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="text-muted-foreground hover:text-foreground transition"
                aria-label={t("co2.how_calculated")}
              >
                <Info className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="text-xs w-72">
              <p className="font-semibold mb-1">{t("co2.how_calculated")}</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>{t("co2.rule_recipe")}</li>
                <li>{t("co2.rule_reservation")}</li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>

        {/* Equivalents */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-accent/40 p-3 flex items-center gap-3">
            <Car className="size-5 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{t("co2.eq_car")}</div>
              <div className="font-semibold text-sm">~{kmInCar} km</div>
            </div>
          </div>
          <div className="rounded-xl bg-accent/40 p-3 flex items-center gap-3">
            <Plane className="size-5 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{t("co2.eq_flights")}</div>
              <div className="font-semibold text-sm">~{flights} {t("co2.flights_unit")}</div>
            </div>
          </div>
        </div>

        {/* Weekly chart */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-medium">{t("co2.last_7")}</div>
          <div className="h-32 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily.map((d) => ({ ...d, label: dayLabel(d.date) }))}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "hsl(var(--accent))" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} kg`, "CO₂"]}
                  labelFormatter={() => ""}
                />
                <Bar dataKey="kg" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
