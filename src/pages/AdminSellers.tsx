import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useHasRole } from "@/hooks/useUserRole";
import { usePendingSellers, useApprovedSellers, useReviewSeller } from "@/hooks/useSeller";
import { CheckCircle2, XCircle, ShieldOff, ExternalLink } from "lucide-react";
import { formatEur } from "@/lib/catalog";

export default function AdminSellers() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { has: isAdmin, isLoading: roleLoading } = useHasRole("admin");
  const { data: pending = [] } = usePendingSellers();
  const { data: approved = [] } = useApprovedSellers();
  const review = useReviewSeller();

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/admin/sellers");
  }, [user, loading, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 container max-w-5xl">
          <div className="h-64 rounded-2xl border border-border/60 bg-card animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 container max-w-2xl">
          <Card>
            <CardHeader>
              <ShieldOff className="size-10 text-destructive mb-2" />
              <CardTitle>Accesso negato</CardTitle>
              <CardDescription>Solo gli amministratori possono accedere a questa pagina.</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const submitReject = async () => {
    if (!rejectId) return;
    await review.mutateAsync({ sellerId: rejectId, decision: "rejected", reason: rejectReason });
    setRejectId(null);
    setRejectReason("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="container max-w-5xl">
          <h1 className="font-display text-4xl font-bold mb-2">Gestione venditori</h1>
          <p className="text-muted-foreground mb-8">Approva, rifiuta o sospendi i venditori del marketplace.</p>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">In attesa ({pending.filter((s) => s.status === "pending").length})</TabsTrigger>
              <TabsTrigger value="approved">Approvati ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rifiutati/sospesi ({pending.filter((s) => s.status !== "pending").length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6 space-y-3">
              {pending.filter((s) => s.status === "pending").length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">Nessuna candidatura in attesa.</CardContent></Card>
              ) : (
                pending.filter((s) => s.status === "pending").map((s) => (
                  <Card key={s.id}>
                    <CardContent className="p-5 flex flex-wrap items-start gap-4">
                      <div className="flex-1 min-w-[240px]">
                        <h3 className="font-display text-lg font-bold">{s.business_name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                          {s.email && <span>📧 {s.email}</span>}
                          {s.phone && <span>📞 {s.phone}</span>}
                          {s.vat_number && <span>VAT: {s.vat_number}</span>}
                          {s.category && <Badge variant="outline">{s.category}</Badge>}
                          {s.website && (
                            <a href={s.website} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                              {s.website} <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => review.mutate({ sellerId: s.id, decision: "approved" })}>
                          <CheckCircle2 className="size-4 mr-1" /> Approva
                        </Button>
                        <Dialog open={rejectId === s.id} onOpenChange={(o) => !o && setRejectId(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setRejectId(s.id)}>
                              <XCircle className="size-4 mr-1" /> Rifiuta
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Motivo rifiuto</DialogTitle>
                            </DialogHeader>
                            <Label>Spiega al candidato</Label>
                            <Textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                            <Button onClick={submitReject} disabled={!rejectReason}>Conferma rifiuto</Button>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-6 space-y-3">
              {approved.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-5 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[240px]">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-lg font-bold">{s.business_name}</h3>
                        {s.is_demo && <Badge variant="secondary">Demo</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">/store/{s.slug}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Ricavi: <strong>{formatEur(s.total_sales_cents)}</strong></span>
                        <span>Ordini: <strong>{s.total_orders}</strong></span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => review.mutate({ sellerId: s.id, decision: "suspended" })}>
                      Sospendi
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6 space-y-3">
              {pending.filter((s) => s.status !== "pending").map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-5 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[240px]">
                      <h3 className="font-display text-lg font-bold">{s.business_name}</h3>
                      <Badge variant={s.status === "rejected" ? "destructive" : "secondary"}>{s.status}</Badge>
                      {s.rejection_reason && <p className="text-sm text-muted-foreground mt-2">{s.rejection_reason}</p>}
                    </div>
                    <Button size="sm" onClick={() => review.mutate({ sellerId: s.id, decision: "approved" })}>
                      <CheckCircle2 className="size-4 mr-1" /> Riattiva
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
