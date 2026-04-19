import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useSendSellerMessage } from "@/hooks/useSellerMessages";
import { toast } from "sonner";

const contactSchema = z.object({
  sender_name: z.string().trim().min(1, "Nome obbligatorio").max(120),
  sender_email: z.string().trim().email("Email non valida").max(255),
  sender_phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().min(1, "Oggetto obbligatorio").max(200),
  message: z.string().trim().min(10, "Almeno 10 caratteri").max(4000),
});

interface ContactSellerDialogProps {
  sellerId: string;
  sellerName: string;
  trigger?: React.ReactNode;
}

export function ContactSellerDialog({ sellerId, sellerName, trigger }: ContactSellerDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const sendMessage = useSendSellerMessage();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    sender_name: "",
    sender_email: user?.email ?? "",
    sender_phone: "",
    subject: "",
    message: "",
    website: "", // honeypot — must stay empty
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    try {
      await sendMessage.mutateAsync({
        seller_id: sellerId,
        sender_name: parsed.data.sender_name,
        sender_email: parsed.data.sender_email,
        sender_phone: parsed.data.sender_phone || undefined,
        subject: parsed.data.subject,
        message: parsed.data.message,
        website: form.website,
      });
      toast.success(t("contact_seller.success", "Messaggio inviato! Il venditore ti risponderà via email."));
      setOpen(false);
      setForm({
        sender_name: "",
        sender_email: user?.email ?? "",
        sender_phone: "",
        subject: "",
        message: "",
        website: "",
      });
    } catch (err: any) {
      toast.error(err?.message ?? t("contact_seller.error", "Errore nell'invio"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Mail className="size-4 mr-2" />
            {t("contact_seller.cta", "Contatta venditore")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("contact_seller.title", "Contatta {{name}}", { name: sellerName })}</DialogTitle>
          <DialogDescription>
            {t(
              "contact_seller.description",
              "Il tuo messaggio sarà recapitato direttamente al venditore. Email e telefono restano privati.",
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cs-name">{t("contact_seller.name", "Il tuo nome")} *</Label>
            <Input
              id="cs-name"
              value={form.sender_name}
              onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
              maxLength={120}
              required
            />
            {errors.sender_name && <p className="text-xs text-destructive">{errors.sender_name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cs-email">Email *</Label>
            <Input
              id="cs-email"
              type="email"
              value={form.sender_email}
              onChange={(e) => setForm({ ...form, sender_email: e.target.value })}
              maxLength={255}
              required
            />
            {errors.sender_email && <p className="text-xs text-destructive">{errors.sender_email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cs-phone">{t("contact_seller.phone", "Telefono (opzionale)")}</Label>
            <Input
              id="cs-phone"
              type="tel"
              value={form.sender_phone}
              onChange={(e) => setForm({ ...form, sender_phone: e.target.value })}
              maxLength={40}
            />
            {errors.sender_phone && <p className="text-xs text-destructive">{errors.sender_phone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cs-subject">{t("contact_seller.subject", "Oggetto")} *</Label>
            <Input
              id="cs-subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              maxLength={200}
              required
            />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cs-message">{t("contact_seller.message", "Messaggio")} *</Label>
            <Textarea
              id="cs-message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={4000}
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.message ? <span className="text-destructive">{errors.message}</span> : <span />}
              <span>{form.message.length}/4000</span>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={sendMessage.isPending}>
            <Send className="size-4 mr-2" />
            {sendMessage.isPending
              ? t("contact_seller.sending", "Invio in corso...")
              : t("contact_seller.send", "Invia messaggio")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
