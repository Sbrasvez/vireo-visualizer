import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMySeller } from "@/hooks/useSeller";
import { useMyProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/useSellerProducts";
import { useSellerOrders, useUpdateFulfillment } from "@/hooks/useSellerOrders";
import { formatEur } from "@/lib/catalog";
import { Plus, Package, Wallet, ShoppingBag, TrendingUp, Trash2, Eye, EyeOff, Truck, MessageCircleQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSellerQuestions, useAnswerQuestion } from "@/hooks/useProductQuestions";

const CATEGORIES = ["kitchen", "home", "personal", "reuse", "bio", "fashion", "beauty", "garden"];

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: seller, isLoading: loadingSeller } = useMySeller();
  const { data: products = [] } = useMyProducts(seller?.id);
  const { data: orders = [] } = useSellerOrders(seller?.id);
  const createProduct = useCreateProduct(seller?.id);
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const updateFulfillment = useUpdateFulfillment();
  const { data: questions = [] } = useSellerQuestions(seller?.id);
  const answerQuestion = useAnswerQuestion();
  const unansweredCount = questions.filter((q) => !q.answer).length;

  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "kitchen",
    price_eur: "",
    compare_eur: "",
    stock: "10",
    unlimited_stock: false,
    is_reused: false,
    is_bio: false,
    shipping_eur: "0",
    is_published: true,
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/seller/dashboard");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loadingSeller && user && !seller) navigate("/sell/apply");
  }, [seller, loadingSeller, user, navigate]);

  if (loading || loadingSeller || !seller) {
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

  if (seller.status !== "approved") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Candidatura {seller.status}</CardTitle>
              <CardDescription>
                {seller.status === "pending" && "Stiamo valutando la tua candidatura. Riceverai una risposta entro 48h."}
                {seller.status === "rejected" && (seller.rejection_reason || "La candidatura è stata rifiutata.")}
                {seller.status === "suspended" && "Il tuo account è temporaneamente sospeso."}
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("seller-assets").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("seller-assets").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Immagine caricata");
    } catch (e: any) {
      toast.error(e.message ?? "Errore upload");
    } finally {
      setUploading(false);
    }
  };

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Math.round(parseFloat(form.price_eur || "0") * 100);
    if (!form.name || price < 50) {
      toast.error("Nome e prezzo (min 0,50€) obbligatori");
      return;
    }
    await createProduct.mutateAsync({
      name: form.name,
      description: form.description || undefined,
      category: form.category,
      price_cents: price,
      compare_at_price_cents: form.compare_eur ? Math.round(parseFloat(form.compare_eur) * 100) : null,
      stock: parseInt(form.stock || "0", 10),
      unlimited_stock: form.unlimited_stock,
      is_reused: form.is_reused,
      is_bio: form.is_bio,
      shipping_cents: Math.round(parseFloat(form.shipping_eur || "0") * 100),
      is_published: form.is_published,
      images: form.image_url ? [form.image_url] : [],
    });
    setOpenCreate(false);
    setForm({
      name: "",
      description: "",
      category: "kitchen",
      price_eur: "",
      compare_eur: "",
      stock: "10",
      unlimited_stock: false,
      is_reused: false,
      is_bio: false,
      shipping_eur: "0",
      is_published: true,
      image_url: "",
    });
  };

  const stats = {
    revenue: seller.total_sales_cents,
    orders: seller.total_orders,
    products: products.length,
    published: products.filter((p) => p.is_published).length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="container max-w-6xl">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <Badge className="mb-2">Venditore approvato</Badge>
              <h1 className="font-display text-4xl font-bold">{seller.business_name}</h1>
              <p className="text-muted-foreground">
                Commissione: {Math.round(seller.commission_rate * 100)}% · Slug: /store/{seller.slug}
              </p>
            </div>
            <Button asChild variant="outline">
              <a href={`/store/${seller.slug}`} target="_blank" rel="noreferrer">
                <Eye className="size-4 mr-2" /> Vedi store pubblico
              </a>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatBlock icon={Wallet} label="Ricavi netti" value={formatEur(stats.revenue)} />
            <StatBlock icon={ShoppingBag} label="Ordini totali" value={String(stats.orders)} />
            <StatBlock icon={Package} label="Prodotti pubblicati" value={`${stats.published}/${stats.products}`} />
            <StatBlock icon={TrendingUp} label="Rating" value={(seller.rating ?? 0).toFixed(1)} />
          </div>

          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Prodotti ({products.length})</TabsTrigger>
              <TabsTrigger value="orders">Ordini ({orders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <div className="flex justify-end mb-4">
                <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4 mr-2" /> Nuovo prodotto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nuovo prodotto</DialogTitle>
                      <DialogDescription>Verrà pubblicato subito sul marketplace.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitProduct} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome *</Label>
                        <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Descrizione</Label>
                        <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Prezzo (€) *</Label>
                          <Input type="number" step="0.01" min="0.50" required value={form.price_eur} onChange={(e) => setForm({ ...form, price_eur: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Prezzo barrato (€)</Label>
                          <Input type="number" step="0.01" min="0" value={form.compare_eur} onChange={(e) => setForm({ ...form, compare_eur: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Spedizione (€)</Label>
                          <Input type="number" step="0.01" min="0" value={form.shipping_eur} onChange={(e) => setForm({ ...form, shipping_eur: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Stock</Label>
                          <Input type="number" min="0" disabled={form.unlimited_stock} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                        </div>
                        <div className="flex items-end gap-2">
                          <Switch id="unlimited" checked={form.unlimited_stock} onCheckedChange={(v) => setForm({ ...form, unlimited_stock: v })} />
                          <Label htmlFor="unlimited" className="cursor-pointer">Stock illimitato</Label>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch id="reused" checked={form.is_reused} onCheckedChange={(v) => setForm({ ...form, is_reused: v })} />
                          <Label htmlFor="reused">Riuso</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch id="bio" checked={form.is_bio} onCheckedChange={(v) => setForm({ ...form, is_bio: v })} />
                          <Label htmlFor="bio">Bio</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch id="pub" checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                          <Label htmlFor="pub">Pubblica</Label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Immagine</Label>
                        <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                        {form.image_url && <img src={form.image_url} alt="" className="size-24 rounded-lg object-cover" />}
                      </div>
                      <Button type="submit" className="w-full" disabled={createProduct.isPending || uploading}>
                        {createProduct.isPending ? "Pubblicazione..." : "Pubblica prodotto"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {products.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground">Nessun prodotto. Pubblica il primo!</CardContent></Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <Card key={p.id}>
                      <div className="aspect-square bg-muted overflow-hidden rounded-t-xl">
                        {p.primary_image ? <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-muted-foreground"><Package className="size-12" /></div>}
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {!p.is_published && <Badge variant="secondary"><EyeOff className="size-3 mr-1" />Bozza</Badge>}
                          {p.is_bio && <Badge className="bg-tertiary text-tertiary-foreground">Bio</Badge>}
                          {p.is_reused && <Badge variant="secondary">Riuso</Badge>}
                        </div>
                        <h3 className="font-display font-semibold line-clamp-2 min-h-[2.5em]">{p.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{formatEur(p.price_cents)}</span>
                          <span className="text-xs text-muted-foreground">{p.unlimited_stock ? "∞" : `${p.stock} pz`}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => updateProduct.mutate({ id: p.id, patch: { is_published: !p.is_published } })}>
                            {p.is_published ? <><EyeOff className="size-3 mr-1" />Nascondi</> : <><Eye className="size-3 mr-1" />Pubblica</>}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { if (confirm("Eliminare?")) deleteProduct.mutate(p.id); }}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              {orders.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground">Nessun ordine ancora.</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <Card key={o.id}>
                      <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                        {o.product_image && <img src={o.product_image} alt="" className="size-16 rounded-lg object-cover" />}
                        <div className="flex-1 min-w-[180px]">
                          <h4 className="font-semibold">{o.product_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ×{o.quantity} · {o.order?.customer_email}
                          </p>
                          <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatEur(o.seller_amount_cents)}</div>
                          <div className="text-xs text-muted-foreground">su {formatEur(o.line_total_cents)}</div>
                        </div>
                        <Select
                          value={o.fulfillment_status}
                          onValueChange={(v) => updateFulfillment.mutate({ itemId: o.id, status: v as any })}
                        >
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">In attesa</SelectItem>
                            <SelectItem value="shipped">Spedito</SelectItem>
                            <SelectItem value="delivered">Consegnato</SelectItem>
                            <SelectItem value="cancelled">Annullato</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 grid place-items-center">
            <Icon className="size-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="font-display text-xl font-bold">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
