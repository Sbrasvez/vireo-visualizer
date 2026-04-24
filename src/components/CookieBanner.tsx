import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCookieConsent } from "@/hooks/useCookieConsent";

type EditablePrefs = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

const DEFAULT_PREFS: EditablePrefs = {
  preferences: true,
  analytics: false,
  marketing: false,
};

function prefsFromConsent(
  consent: ReturnType<typeof useCookieConsent>["consent"],
): EditablePrefs {
  if (!consent) return DEFAULT_PREFS;
  return {
    preferences: consent.preferences,
    analytics: consent.analytics,
    marketing: consent.marketing,
  };
}

function prefsEqual(a: EditablePrefs, b: EditablePrefs) {
  return (
    a.preferences === b.preferences &&
    a.analytics === b.analytics &&
    a.marketing === b.marketing
  );
}

export default function CookieBanner() {
  const {
    consent,
    showBanner,
    showPreferences,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
  } = useCookieConsent();

  // Baseline = ultimo consenso salvato (o default se mai salvato)
  const baseline = useMemo<EditablePrefs>(() => prefsFromConsent(consent), [consent]);
  const [prefs, setPrefs] = useState<EditablePrefs>(baseline);

  // Quando si apre il dialog (o cambia la baseline), ripopoliamo i toggle
  // dall'ultimo consenso effettivamente salvato.
  useEffect(() => {
    if (showPreferences) {
      setPrefs(baseline);
    }
  }, [showPreferences, baseline]);

  const isDirty = !prefsEqual(prefs, baseline);
  const hasSavedConsent = consent !== null;

  const handleRevert = () => {
    setPrefs(baseline);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Chiusura senza salvare: scartiamo eventuali modifiche pendenti
      setPrefs(baseline);
      closePreferences();
    }
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
            role="dialog"
            aria-live="polite"
            aria-label="Avviso cookie"
          >
            <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex size-10 shrink-0 rounded-xl bg-primary/10 items-center justify-center">
                  <Cookie className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display font-semibold text-base mb-1">
                    Rispettiamo la tua privacy
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Usiamo cookie tecnici necessari al funzionamento del sito. Con il tuo consenso usiamo
                    anche cookie di preferenza per migliorare la tua esperienza. Leggi la{" "}
                    <Link to="/cookies" className="text-primary underline underline-offset-2">
                      Cookie Policy
                    </Link>{" "}
                    e la{" "}
                    <Link to="/privacy" className="text-primary underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Button onClick={acceptAll} className="sm:flex-1">
                      Accetta tutti
                    </Button>
                    <Button onClick={rejectAll} variant="secondary" className="sm:flex-1">
                      Rifiuta non essenziali
                    </Button>
                    <Button onClick={openPreferences} variant="outline" className="sm:flex-1">
                      Personalizza
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showPreferences} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Preferenze cookie</DialogTitle>
            <DialogDescription>
              Scegli quali categorie di cookie vuoi attivare. I cookie necessari sono sempre attivi
              perché indispensabili al funzionamento del sito.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <PreferenceRow
              title="Necessari"
              description="Autenticazione, sessione, carrello, lingua. Sempre attivi."
              checked
              disabled
            />
            <PreferenceRow
              title="Preferenze"
              description="Memorizzano le tue scelte (es. tema, filtri preferiti) per migliorare l'esperienza."
              checked={prefs.preferences}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, preferences: v }))}
            />
            <PreferenceRow
              title="Statistiche / Analytics"
              description="Ci aiutano a capire come usi il sito in forma aggregata e anonima. Attualmente non in uso."
              checked={prefs.analytics}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
            />
            <PreferenceRow
              title="Marketing"
              description="Per personalizzare comunicazioni promozionali. Attualmente non in uso."
              checked={prefs.marketing}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
            />
          </div>

          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs"
            aria-live="polite"
          >
            <span className={isDirty ? "text-foreground" : "text-muted-foreground"}>
              {isDirty
                ? "Modifiche non salvate rispetto all'ultimo consenso."
                : hasSavedConsent
                  ? "Nessuna modifica rispetto all'ultimo consenso salvato."
                  : "Nessuna preferenza ancora salvata."}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRevert}
              disabled={!isDirty}
              className="h-7 px-2 text-xs"
              aria-label="Annulla modifiche e ripristina l'ultimo consenso salvato"
            >
              <Undo2 className="size-3.5 mr-1" />
              Annulla modifiche
            </Button>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={rejectAll}>
              Rifiuta tutti
            </Button>
            <Button
              variant="outline"
              onClick={() => savePreferences(prefs)}
              disabled={hasSavedConsent && !isDirty}
            >
              Salva scelte
            </Button>
            <Button onClick={acceptAll}>Accetta tutti</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div className="min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  );
}
