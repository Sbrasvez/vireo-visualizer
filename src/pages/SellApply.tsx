import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useApplyAsSeller, useMySeller } from "@/hooks/useSeller";
import { Clock, CheckCircle2, XCircle, Store } from "lucide-react";

const CATEGORIES = ["kitchen", "home", "personal", "reuse", "bio", "fashion", "beauty", "garden"];

export default function SellApply() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: mySeller, isLoading: loadingSeller } = useMySeller();
  const apply = useApplyAsSeller();

  const [form, setForm] = useState({
    business_name: "",
    description: "",
    category: "kitchen",
    email: "",
    phone: "",
    vat_number: "",
    website: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/sell/apply");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.email && !form.email) setForm((f) => ({ ...f, email: user.email! }));
  }, [user, form.email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name.trim() || form.business_name.length < 3) return;
    await apply.mutateAsync(form);
  };

  if (loading || loadingSeller) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 container max-w-2xl">
          <div className="h-64 rounded-2xl border border-border/60 bg-card animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  if (mySeller) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container max-w-2xl">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {mySeller.status === "approved" && (
                    <CheckCircle2 className="size-8 text-primary" />
                  )}
                  {mySeller.status === "pending" && <Clock className="size-8 text-tertiary" />}
                  {mySeller.status === "rejected" && (
                    <XCircle className="size-8 text-destructive" />
                  )}
                  {mySeller.status === "suspended" && <XCircle className="size-8 text-destructive" />}
                  <div>
                    <CardTitle className="font-display text-2xl">
                      {mySeller.business_name}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant={mySeller.status === "approved" ? "default" : "secondary"}>
                        {mySeller.status === "approved" && "Approvato"}
                        {mySeller.status === "pending" && "In revisione"}
                        {mySeller.status === "rejected" && "Rifiutato"}
                        {mySeller.status === "suspended" && "Sospeso"}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mySeller.status === "pending" && (
                  <p className="text-muted-foreground">
                    Stiamo valutando la tua candidatura. Riceverai una risposta entro 48 ore.
                  </p>
                )}
                {mySeller.status === "approved" && (
                  <>
                    <p className="text-muted-foreground">
                      Congratulazioni! Il tuo store è attivo. Inizia a pubblicare prodotti.
                    </p>
                    <Button asChild>
                      <Link to="/seller/dashboard">
                        <Store className="size-4 mr-2" /> Vai alla dashboard
                      </Link>
                    </Button>
                  </>
                )}
                {mySeller.status === "rejected" && (
                  <>
                    <p className="text-muted-foreground">
                      Purtroppo non possiamo accettare la tua candidatura.
                    </p>
                    {mySeller.rejection_reason && (
                      <p className="text-sm bg-muted p-3 rounded-lg">
                        <strong>Motivo:</strong> {mySeller.rejection_reason}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="container max-w-2xl">
          <h1 className="font-display text-4xl font-bold mb-2">Diventa venditore</h1>
          <p className="text-muted-foreground mb-8">
            Ti rispondiamo entro 48h. Commissione del 15% solo sulle vendite. Nessun costo fisso.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nome attività *</Label>
              <Input
                id="business_name"
                required
                minLength={3}
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione brand *</Label>
              <Textarea
                id="description"
                required
                rows={4}
                placeholder="Cosa vendi? Cosa rende il tuo brand sostenibile?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria principale</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_number">P.IVA / Codice fiscale</Label>
                <Input
                  id="vat_number"
                  value={form.vat_number}
                  onChange={(e) => setForm({ ...form, vat_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email contatto</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sito web (opzionale)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={apply.isPending}>
              {apply.isPending ? "Invio in corso..." : "Invia candidatura"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
