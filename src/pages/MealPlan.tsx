import { useState } from "react";
import { Sparkles, Calendar, Leaf, ShoppingBag, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentMealPlan, useGenerateMealPlan } from "@/hooks/useMealPlan";
import { useShoppingList } from "@/hooks/useShoppingList";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function MealPlan() {
  const { user } = useAuth();
  const { data: plan, isLoading } = useCurrentMealPlan();
  const generate = useGenerateMealPlan();
  const { addItems } = useShoppingList();

  const [diet, setDiet] = useState("plant-based");
  const [calories, setCalories] = useState(2000);
  const [allergies, setAllergies] = useState("");

  const handleGenerate = () => {
    generate.mutate({
      diet,
      calories,
      allergies: allergies.split(",").map((a) => a.trim()).filter(Boolean),
      servings: 2,
    });
  };

  const addAllToList = () => {
    if (!plan?.plan_data?.shopping_list?.length) return;
    addItems(
      plan.plan_data.shopping_list.map((name) => ({
        name,
        category: "auto",
        recipeTitle: "Meal Plan AI",
      }))
    );
    toast.success(`${plan.plan_data.shopping_list.length} ingredienti aggiunti`);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Sparkles className="size-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Accedi per il Meal Plan AI</h2>
          <Button asChild className="mt-4"><Link to="/login">Accedi</Link></Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <h1 className="text-3xl font-display font-bold">Meal Plan AI</h1>
          </div>
          <p className="text-muted-foreground">
            7 giorni di pasti plant-based personalizzati, generati da AI in pochi secondi.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Le tue preferenze</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Tipo di dieta</Label>
              <Select value={diet} onValueChange={setDiet}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plant-based">Plant-based</SelectItem>
                  <SelectItem value="vegana">Vegana</SelectItem>
                  <SelectItem value="vegetariana">Vegetariana</SelectItem>
                  <SelectItem value="mediterranea">Mediterranea</SelectItem>
                  <SelectItem value="senza glutine">Senza glutine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Calorie/giorno</Label>
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                min={1200}
                max={3500}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Allergie (separate da virgola)</Label>
              <Input
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="es. arachidi, soia"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <Button onClick={handleGenerate} disabled={generate.isPending}>
                {generate.isPending ? (
                  <><Loader2 className="size-4 mr-2 animate-spin" /> Generazione…</>
                ) : (
                  <><Sparkles className="size-4 mr-2" /> {plan ? "Rigenera" : "Genera piano"}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && <p className="text-muted-foreground">Caricamento…</p>}

        {plan && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Calendar className="size-3" /> Settimana del{" "}
                {new Date(plan.week_start).toLocaleDateString("it-IT")}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Leaf className="size-3" /> Eco-score {plan.plan_data.eco_score}/10
              </Badge>
              <Button size="sm" variant="outline" onClick={addAllToList} className="ml-auto">
                <ShoppingBag className="size-4 mr-2" /> Aggiungi tutto alla lista
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {plan.plan_data.days.map((d, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{d.day}</span>
                      <Badge variant="outline" className="text-xs">{d.estimated_calories} kcal</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">🌅 Colazione:</span> {d.meals.breakfast}</div>
                    <div><span className="text-muted-foreground">🥗 Pranzo:</span> {d.meals.lunch}</div>
                    <div><span className="text-muted-foreground">🍽️ Cena:</span> {d.meals.dinner}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="size-5" /> Lista spesa settimanale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {plan.plan_data.shopping_list.map((item, i) => (
                    <Badge key={i} variant="outline">{item}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
