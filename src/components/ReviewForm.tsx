import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  restaurantId: string;
  onSubmitted?: () => void;
}

export function ReviewForm({ restaurantId, onSubmitted }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {t("review_form.login_required")}
      </p>
    );
  }

  const submit = async () => {
    if (rating < 1) {
      toast({ title: t("review_form.rating_required"), variant: "destructive" });
      return;
    }
    if (body.trim().length < 5) {
      toast({ title: t("review_form.body_required"), variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const meta = (user.user_metadata as { display_name?: string; full_name?: string }) || {};
    const authorName = meta.display_name || meta.full_name || user.email?.split("@")[0] || "Vireo user";

    const { error } = await supabase.from("restaurant_reviews").insert({
      restaurant_id: restaurantId,
      user_id: user.id,
      author_name: authorName,
      rating,
      title: title.trim() || null,
      body: body.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: t("review_form.error"), description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("review_form.success") });
    setRating(0);
    setTitle("");
    setBody("");
    onSubmitted?.();
  };

  return (
    <div className="rounded-xl border border-border/60 p-4 bg-accent/20 space-y-3">
      <div className="font-semibold text-sm">{t("review_form.title")}</div>

      {/* Star picker */}
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} stars`}
            className="p-0.5"
          >
            <Star
              className={`size-7 transition ${
                n <= (hover || rating)
                  ? "fill-tertiary text-tertiary"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>

      <div>
        <Label htmlFor="rev-title" className="text-xs">{t("review_form.title_field")}</Label>
        <Input
          id="rev-title"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("review_form.title_placeholder")}
        />
      </div>
      <div>
        <Label htmlFor="rev-body" className="text-xs">{t("review_form.body_field")}*</Label>
        <Textarea
          id="rev-body"
          rows={3}
          maxLength={1000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("review_form.body_placeholder")}
        />
      </div>
      <Button onClick={submit} disabled={submitting} size="sm">
        {submitting && <Loader2 className="size-4 mr-1.5 animate-spin" />}
        {t("review_form.submit")}
      </Button>
    </div>
  );
}
