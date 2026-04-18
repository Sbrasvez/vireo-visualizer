import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTAButton from "@/components/CTAButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProfileSubscription } from "@/components/ProfileSubscription";

export default function Profile() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single();

    if (data) {
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url);
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t("profile.avatar_too_large"), description: t("profile.avatar_too_large_desc"), variant: "destructive" });
      return;
    }

    setUploading(true);
    const filePath = `${user.id}/avatar.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: t("profile.upload_error"), description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const url = `${publicUrl}?t=${Date.now()}`;
    setAvatarUrl(url);

    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("user_id", user.id);

    setUploading(false);
    toast({ title: t("profile.avatar_updated") });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("profile.profile_updated") });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        {/* Editorial header */}
        <section className="gradient-soft py-14 border-b border-border/40">
          <div className="container max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
                — {t("profile.eyebrow", "Il tuo spazio")}
              </span>
              <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">N°01</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] mb-3">
              {t("profile.editorial_title_1", "La tua")}{" "}
              <em className="italic text-primary">{t("profile.editorial_title_2", "identità")}</em>
            </h1>
            <p className="text-muted-foreground max-w-xl text-base">
              {t(
                "profile.editorial_lead",
                "Cura il tuo profilo: il nome che ti rappresenta, una storia da condividere, un volto da riconoscere.",
              )}
            </p>
          </div>
        </section>

        {/* Identity card */}
        <section className="py-14">
          <div className="container max-w-3xl space-y-10">
            <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-primary/15 via-tertiary/10 to-secondary/15" />
              <div className="px-6 sm:px-10 pb-10 -mt-14">
                <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-8">
                  <div className="relative group shrink-0">
                    <Avatar className="size-28 border-4 border-card shadow-lg">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-display">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-1 right-1 size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      aria-label={t("profile.change_avatar", "Cambia foto profilo")}
                    >
                      {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="sm:pb-2 min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
                      — {t("profile.account_eyebrow", "Account")}
                    </div>
                    <h2 className="font-display text-2xl font-semibold truncate">
                      {displayName || t("profile.untitled", "Senza nome")}
                    </h2>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                      — {t("profile.display_name")}
                    </Label>
                    <Input
                      id="displayName"
                      placeholder={t("profile.name_placeholder")}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                      — {t("profile.bio")}
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder={t("profile.bio_placeholder")}
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right font-mono tracking-wide">
                      {bio.length}/500
                    </p>
                  </div>
                  <div className="pt-2">
                    <CTAButton onClick={handleSave} size="md" className="w-full sm:w-auto" disabled={saving}>
                      {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                      {saving ? t("profile.saving") : t("profile.save")}
                    </CTAButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription block */}
            <div className="space-y-3">
              <div className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
                — {t("profile.subscription_eyebrow", "Abbonamento")}
              </div>
              <ProfileSubscription />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
