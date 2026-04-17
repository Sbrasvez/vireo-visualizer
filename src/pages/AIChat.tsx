import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mic, Send, Sparkles, Loader2, Square, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";
import { ChatRecipeCards, type RecipeCardData } from "@/components/ChatRecipeCards";
import {
  ChatRestaurantCards,
  type RestaurantCardData,
} from "@/components/ChatRestaurantCards";

type CardBlock =
  | { kind: "recipes"; data: RecipeCardData[] }
  | { kind: "restaurants"; data: RestaurantCardData[] };

type Msg = {
  role: "user" | "assistant";
  content: string;
  cards?: CardBlock[];
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export default function AIChat() {
  const { t, i18n } = useTranslation();
  const { plan } = usePlan();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [userGeo, setUserGeo] = useState<{ lat: number; lng: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isPro = plan?.tier === "pro" || plan?.tier === "business";
  const used = plan?.ai_messages_today ?? 0;
  const limit = 10;
  const remaining = Math.max(0, limit - used);

  // Try to obtain geolocation once (silent — no popup spam if denied)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        /* user denied / unavailable: model will fall back to city in text */
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  const suggestions = t("ai.suggestions", { returnObjects: true }) as string[];

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: t("ai.voice_unsupported"), variant: "destructive" });
      return;
    }
    const rec = new SR();
    rec.lang =
      i18n.language === "en"
        ? "en-US"
        : i18n.language === "es"
          ? "es-ES"
          : i18n.language === "fr"
            ? "fr-FR"
            : i18n.language === "de"
              ? "de-DE"
              : "it-IT";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const stopStream = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  };

  // Helper: mutate the last assistant message in state
  const updateLastAssistant = (mutator: (m: Msg) => Msg) => {
    setMessages((prev) => {
      const copy = prev.slice();
      const i = copy.length - 1;
      if (i < 0 || copy[i].role !== "assistant") return prev;
      copy[i] = mutator(copy[i]);
      return copy;
    });
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("no_session");

      // Strip cards from history sent to backend (model only needs role+content)
      const wireMessages = next.map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: wireMessages,
          lang: i18n.language,
          user_location: userGeo,
        }),
        signal: ctrl.signal,
      });

      if (resp.status === 429) {
        const j = await resp.json().catch(() => ({}));
        if (j?.error === "quota_exceeded") {
          toast({
            title: t("ai.quota_title"),
            description: t("ai.quota_desc", { limit }),
            variant: "destructive",
          });
        } else {
          toast({
            title: t("ai.rate_title"),
            description: t("ai.rate_desc"),
            variant: "destructive",
          });
        }
        setMessages(messages);
        setStreaming(false);
        return;
      }
      if (resp.status === 402) {
        toast({
          title: t("ai.credits_title"),
          description: t("ai.credits_desc"),
          variant: "destructive",
        });
        setMessages(messages);
        setStreaming(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        toast({
          title: t("ai.error_title"),
          description: t("ai.error_desc"),
          variant: "destructive",
        });
        setMessages(messages);
        setStreaming(false);
        return;
      }

      // Add empty assistant placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "", cards: [] }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);

            // Custom Vireo events
            if (parsed.vireo === "cards") {
              const block: CardBlock | null =
                parsed.kind === "recipes"
                  ? { kind: "recipes", data: parsed.data ?? [] }
                  : parsed.kind === "restaurants"
                    ? { kind: "restaurants", data: parsed.data ?? [] }
                    : null;
              if (block) {
                updateLastAssistant((m) => ({
                  ...m,
                  cards: [...(m.cards ?? []), block],
                }));
              }
              continue;
            }
            if (parsed.vireo === "error") {
              toast({
                title: t("ai.error_title"),
                description: t("ai.error_desc"),
                variant: "destructive",
              });
              continue;
            }

            // Standard token delta
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              updateLastAssistant((m) => ({ ...m, content: assistant }));
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error(e);
        toast({
          title: t("ai.error_title"),
          description: t("ai.error_desc"),
          variant: "destructive",
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="border-b border-border/60 bg-background/80 backdrop-blur px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center shrink-0">
              <Sparkles className="size-5 text-primary-foreground" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold truncate">{t("ai.title")}</h1>
              <p className="text-xs text-muted-foreground truncate">{t("ai.subtitle")}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {isPro ? (
              <span className="inline-flex items-center gap-1 text-primary font-medium">
                <Crown className="size-3.5" /> {t("ai.unlimited")}
              </span>
            ) : (
              <span>
                {t("ai.remaining", { count: remaining })} / {limit}
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="size-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 grid place-items-center mb-4">
                  <Sparkles className="size-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">{t("ai.empty_title")}</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                  {t("ai.empty_desc")}
                </p>
                <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {Array.isArray(suggestions) &&
                    suggestions.map((s, i) => (
                      <Card
                        key={i}
                        onClick={() => send(s)}
                        className="p-3 text-left text-sm cursor-pointer hover:border-primary/50 hover:bg-accent/40 transition"
                      >
                        {s}
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {m.role === "assistant" && (
                  <span className="size-8 rounded-lg bg-primary/15 grid place-items-center shrink-0 mt-0.5">
                    <Sparkles className="size-4 text-primary" />
                  </span>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.role === "assistant" ? (
                    <>
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-headings:mt-2 prose-headings:mb-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content || (m.cards && m.cards.length > 0 ? "" : "…")}
                        </ReactMarkdown>
                      </div>
                      {m.cards?.map((block, bi) =>
                        block.kind === "recipes" ? (
                          <ChatRecipeCards key={bi} data={block.data} />
                        ) : (
                          <ChatRestaurantCards key={bi} data={block.data} />
                        ),
                      )}
                    </>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  )}
                </div>
              </div>
            ))}

            {streaming && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <span className="size-8 rounded-lg bg-primary/15 grid place-items-center shrink-0">
                  <Loader2 className="size-4 text-primary animate-spin" />
                </span>
                <div className="rounded-2xl px-4 py-2.5 bg-muted text-sm text-muted-foreground">
                  {t("ai.thinking")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quota warning */}
        {!isPro && remaining <= 2 && (
          <div className="px-3 sm:px-6 pb-1">
            <div className="max-w-3xl mx-auto text-xs bg-tertiary/10 border border-tertiary/30 rounded-md px-3 py-2 text-tertiary-foreground flex items-center justify-between gap-2">
              <span>{t("ai.low_quota", { count: remaining })}</span>
              <Button asChild size="sm" variant="link" className="h-auto p-0 text-tertiary-foreground">
                <Link to="/pricing">{t("ai.upgrade")}</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border/60 bg-background/80 backdrop-blur px-3 sm:px-6 py-3"
        >
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <Button
              type="button"
              size="icon"
              variant={listening ? "default" : "outline"}
              onClick={listening ? stopVoice : startVoice}
              disabled={streaming}
              aria-label={t("ai.voice")}
              className="shrink-0"
            >
              <Mic className={cn("size-4", listening && "animate-pulse")} />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={t("ai.placeholder")}
              rows={1}
              className="flex-1 resize-none min-h-10 max-h-40 py-2.5"
              disabled={streaming}
            />
            {streaming ? (
              <Button type="button" size="icon" variant="destructive" onClick={stopStream} className="shrink-0">
                <Square className="size-4" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()} className="shrink-0">
                <Send className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
