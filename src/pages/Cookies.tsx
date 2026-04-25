import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Undo2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cookieStatusStyles, resolveCookieStatus } from "@/lib/cookieStatus";

type CookieRow = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  type: "HTTP" | "localStorage" | "sessionStorage";
};

const necessaryCookies: CookieRow[] = [
  {
    name: "sb-access-token / sb-refresh-token",
    provider: "Lovable Cloud (Supabase)",
    purpose: "Mantengono la sessione di autenticazione dell'utente.",
    duration: "1 ora (access) / 30 giorni (refresh)",
    type: "localStorage",
  },
  {
    name: "vireo-cookie-consent",
    provider: "Vireo (prima parte)",
    purpose: "Memorizza le tue preferenze di consenso ai cookie.",
    duration: "12 mesi",
    type: "localStorage",
  },
  {
    name: "i18nextLng",
    provider: "Vireo (prima parte)",
    purpose: "Ricorda la lingua selezionata dall'utente.",
    duration: "Persistente fino a cancellazione",
    type: "localStorage",
  },
  {
    name: "vireo-cart",
    provider: "Vireo (prima parte)",
    purpose: "Conserva i prodotti aggiunti al carrello del marketplace.",
    duration: "Persistente fino a cancellazione",
    type: "localStorage",
  },
  {
    name: "__stripe_mid / __stripe_sid",
    provider: "Stripe Payments Europe Ltd.",
    purpose: "Prevenzione frodi durante il checkout. Necessari al pagamento.",
    duration: "1 anno / 30 minuti",
    type: "HTTP",
  },
];

const preferenceCookies: CookieRow[] = [
  {
    name: "vireo-ui-prefs",
    provider: "Vireo (prima parte)",
    purpose: "Memorizza scelte UI come tema, filtri preferiti, ordinamento.",
    duration: "12 mesi",
    type: "localStorage",
  },
];

const thirdParties = [
  {
    name: "Stripe",
    role: "Pagamenti e prevenzione frodi",
    country: "Irlanda (UE) + USA",
    policy: "https://stripe.com/it/privacy",
  },
  {
    name: "Mapbox",
    role: "Visualizzazione mappe ristoranti",
    country: "USA",
    policy: "https://www.mapbox.com/legal/privacy",
  },
  {
    name: "Google (OAuth)",
    role: "Login social opzionale",
    country: "Irlanda (UE) + USA",
    policy: "https://policies.google.com/privacy",
  },
  {
    name: "Lovable Cloud (Supabase)",
    role: "Backend, autenticazione, database",
    country: "UE (Francoforte)",
    policy: "https://supabase.com/privacy",
  },
];

export default function Cookies() {
  const {
    openPreferences,
    consent,
    consentDate,
    showPreferences,
    isDirty,
    justUpdated,
    revertDraft,
  } = useCookieConsent();
  const { hash, pathname, key: locationKey } = useLocation();
  // Notifica on-page mostrata quando un hash richiesto non viene trovato.
  // Conserva l'id originale per essere mostrato all'utente, oppure null.
  const [missingHash, setMissingHash] = useState<string | null>(null);

  // Gestione hash robusta: dopo navigazione (ScrollToTop forza top:0 su cambio
  // pathname), portiamo lo scroll fluido all'ancora richiesta — qualunque sia
  // l'hash, non solo #categorie-cookie. Usiamo doppio rAF per eseguire DOPO
  // l'effetto di ScrollToTop e un piccolo retry per coprire sezioni montate
  // tardivamente. Rispettiamo prefers-reduced-motion.
  useEffect(() => {
    if (!hash || hash === "#") {
      // Nessun hash richiesto: archivia eventuale notifica precedente.
      setMissingHash(null);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    if (!id) {
      setMissingHash(null);
      return;
    }
    // Nuovo tentativo: nascondi una eventuale notifica residua.
    setMissingHash(null);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    // Memorizziamo il focus precedente solo se è un elemento "vero" (non body)
    // così, dopo lo scroll all'ancora, possiamo restituirglielo senza che il
    // focus rimanga permanentemente bloccato sull'header della sezione.
    const previousActive =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;

    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cleanupTarget: (() => void) | null = null;

    const restorePreviousFocus = (target: HTMLElement) => {
      // Ripristina il focus precedente SOLO se nessun altro elemento ha
      // rubato il focus nel frattempo (evita di scavalcare l'utente).
      if (document.activeElement !== target) return;
      if (!previousActive || !previousActive.isConnected) return;
      previousActive.focus({ preventScroll: true });
    };

    const handleMissingTarget = () => {
      // Fallback: ancora inesistente. NON tocchiamo il focus (niente
      // tabindex temporaneo, niente restore di un focus mai spostato) e
      // facciamo solo uno scroll fluido all'inizio della pagina, così
      // l'utente non resta su una posizione casuale lasciata dal browser
      // dopo aver tentato di risolvere l'hash.
      if (cancelled) return;
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior });
      }
      // Notifica visibile + log diagnostico.
      setMissingHash(id);
      if (typeof console !== "undefined") {
        console.warn(`[Cookies] Hash anchor "#${id}" non trovato — fallback a top.`);
      }
    };

    const scrollToTarget = (attempt = 0) => {
      if (cancelled) return;
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior, block: "start" });

        // Sposta temporaneamente il focus sul target per a11y / screen reader.
        const prevTabIndex = target.getAttribute("tabindex");
        const tabIndexAdded = prevTabIndex === null;
        if (tabIndexAdded) target.setAttribute("tabindex", "-1");
        (target as HTMLElement).focus({ preventScroll: true });

        // Se l'utente sposta il focus (Tab, click), consideriamo conclusa la
        // "presa di focus" e puliamo subito; se invece resta sul target,
        // lo restituiamo all'elemento precedente dopo un breve delay.
        const onBlur = () => {
          cleanup();
        };
        target.addEventListener("blur", onBlur, { once: true });

        const restoreTimer = setTimeout(() => {
          restorePreviousFocus(target as HTMLElement);
          cleanup();
        }, 800);
        timers.push(restoreTimer);

        const cleanup = () => {
          target.removeEventListener("blur", onBlur);
          if (tabIndexAdded) target.removeAttribute("tabindex");
          cleanupTarget = null;
        };
        cleanupTarget = cleanup;
        return;
      }
      // Retry breve se la sezione non è ancora nel DOM (max ~600ms).
      if (attempt < 6) {
        timers.push(setTimeout(() => scrollToTarget(attempt + 1), 100));
        return;
      }
      // Esauriti i retry: attiviamo il fallback senza toccare il focus.
      handleMissingTarget();
    };

    // Doppio rAF: assicura esecuzione dopo ScrollToTop (montato prima nell'albero).
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => scrollToTarget());
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      timers.forEach(clearTimeout);
      cleanupTarget?.();
    };
    // locationKey cambia anche quando si naviga allo stesso hash (es. ri-click
    // sul pulsante "Vedi categorie"), permettendo di ri-scrollare.
  }, [hash, pathname, locationKey]);

  const formattedConsentDate = consentDate
    ? new Date(consentDate).toLocaleString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Stato unificato condiviso con il banner globale: pilota icone + colori
  // sia del badge header sia del pannello sticky.
  const statusKey = resolveCookieStatus({ isDirty, justUpdated, consent });
  const status = cookieStatusStyles[statusKey];

  return (
    <main className="container max-w-4xl py-16">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">
          Ultimo aggiornamento documento:{" "}
          {new Date().toLocaleDateString("it-IT", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div
          className={cn(
            "mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all duration-300",
            status.border,
            status.surface,
            status.tone,
            statusKey === "just-updated" && "shadow-sm scale-[1.02]",
            statusKey === "dirty" && "shadow-sm",
          )}
          aria-live="polite"
        >
          <status.Icon className={cn("size-3.5", status.iconClass)} />
          <span>
            {statusKey === "dirty"
              ? formattedConsentDate
                ? `Modifiche non salvate · ultimo consenso ${formattedConsentDate}`
                : "Modifiche non salvate · nessun consenso ancora salvato"
              : statusKey === "just-updated"
                ? `Preferenze aggiornate ora · ${formattedConsentDate}`
                : statusKey === "saved"
                  ? `Tue preferenze · ultimo aggiornamento ${formattedConsentDate}`
                  : "Nessuna preferenza salvata · usa il banner per scegliere"}
          </span>
        </div>
      </header>

      {/* Pannello sticky modifiche pendenti — visibile mentre il dialog è aperto.
          Usa le stesse varianti di stato del badge header per coerenza visiva. */}
      {showPreferences && (
        <div
          className={cn(
            "sticky top-2 z-40 mb-8 rounded-xl border px-4 py-3 shadow-sm backdrop-blur-md transition-all duration-300",
            status.border,
            status.surface,
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm">
              <status.Icon className={cn("size-4 mt-0.5 shrink-0", status.tone, status.iconClass)} />
              <span className={cn(statusKey === "dirty" ? "text-foreground font-medium" : status.tone)}>
                {statusKey === "dirty"
                  ? "Hai modifiche non salvate nelle preferenze cookie."
                  : statusKey === "just-updated"
                    ? "Preferenze cookie aggiornate."
                    : statusKey === "saved"
                      ? "Le preferenze nel dialog corrispondono all'ultimo consenso salvato."
                      : "Stai impostando le preferenze per la prima volta."}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={revertDraft}
              disabled={!isDirty}
              className="self-start sm:self-auto"
              aria-label="Annulla modifiche e ripristina l'ultimo consenso salvato"
            >
              <Undo2 className="size-3.5 mr-1.5" />
              Annulla modifiche
            </Button>
          </div>
        </div>
      )}

      <section className="space-y-10 text-sm leading-relaxed">
        <div className="space-y-3">
          <p>
            Questa Cookie Policy spiega come <strong>Vireo</strong> utilizza cookie e
            tecnologie simili (localStorage, sessionStorage, pixel) quando visiti la piattaforma.
            È redatta in conformità al Regolamento UE 2016/679 (GDPR), all'art. 122 del Codice
            Privacy e alle Linee Guida del Garante Privacy del 10 giugno 2021.
          </p>
          <p>
            Il <strong>Titolare del trattamento</strong> è Vireo. Per esercitare i tuoi diritti o
            per qualsiasi richiesta scrivi a{" "}
            <a href="mailto:privacy@vireo.app" className="text-primary underline underline-offset-2">
              privacy@vireo.app
            </a>
            . Vedi anche la nostra{" "}
            <Link to="/privacy" className="text-primary underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">1. Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo memorizzati sul tuo dispositivo che permettono
            al sito di riconoscerti, ricordare le tue preferenze e migliorare l'esperienza.
            Tecnologie simili come <strong>localStorage</strong> e <strong>sessionStorage</strong>{" "}
            sono memorie del browser usate per gli stessi scopi e ricadono nella medesima disciplina.
          </p>
        </div>

        <div id="categorie-cookie" className="scroll-mt-24">
          <h2 className="text-xl font-semibold mb-3">2. Categorie di cookie utilizzati</h2>
          <p className="mb-4">
            Suddividiamo i cookie in quattro categorie. Solo i <strong>cookie tecnici</strong> sono
            sempre attivi; per le altre categorie chiediamo il tuo consenso libero, specifico,
            informato e revocabile in ogni momento.
          </p>

          <div className="space-y-6">
            <CategoryBlock
              title="Cookie tecnici (necessari)"
              status="Sempre attivi"
              statusVariant="default"
              description="Indispensabili per il funzionamento del sito (login, sicurezza, carrello, checkout). Non richiedono consenso ai sensi dell'art. 122 del Codice Privacy."
              base="Interesse legittimo / esecuzione del contratto"
              rows={necessaryCookies}
              isActive
            />

            <CategoryBlock
              title="Cookie di preferenza"
              status={consent?.preferences ? "Attivi" : "Disattivati"}
              statusVariant={consent?.preferences ? "default" : "secondary"}
              description="Memorizzano scelte fatte dall'utente (es. tema, filtri, ordinamento) per migliorare l'esperienza. Richiedono il tuo consenso."
              base="Consenso (art. 6.1.a GDPR)"
              rows={preferenceCookies}
              isActive={!!consent?.preferences}
            />

            <CategoryBlock
              title="Cookie statistici / analytics"
              status={consent?.analytics ? "Consentiti (nessuno attivo)" : "Non in uso"}
              statusVariant={consent?.analytics ? "default" : "secondary"}
              description="Ci aiuterebbero a capire in forma aggregata come gli utenti usano il sito. Attualmente Vireo NON utilizza alcun cookie analitico o di profilazione di terze parti. Se in futuro li introdurremo, ti chiederemo un nuovo consenso esplicito."
              base="Consenso (art. 6.1.a GDPR)"
              rows={[]}
              isActive={!!consent?.analytics}
            />

            <CategoryBlock
              title="Cookie marketing"
              status={consent?.marketing ? "Consentiti (nessuno attivo)" : "Non in uso"}
              statusVariant={consent?.marketing ? "default" : "secondary"}
              description="Servirebbero a personalizzare comunicazioni pubblicitarie. Attualmente NON in uso."
              base="Consenso (art. 6.1.a GDPR)"
              rows={[]}
              isActive={!!consent?.marketing}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Servizi di terze parti</h2>
          <p className="mb-4">
            Alcune funzionalità si appoggiano a fornitori esterni che possono impostare propri
            cookie o tecnologie equivalenti. Ti invitiamo a consultare le rispettive informative.
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornitore</TableHead>
                  <TableHead>Finalità</TableHead>
                  <TableHead>Paese</TableHead>
                  <TableHead>Privacy policy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thirdParties.map((tp) => (
                  <TableRow key={tp.name}>
                    <TableCell className="font-medium">{tp.name}</TableCell>
                    <TableCell>{tp.role}</TableCell>
                    <TableCell>{tp.country}</TableCell>
                    <TableCell>
                      <a
                        href={tp.policy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2"
                      >
                        Apri
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            I trasferimenti verso paesi extra-UE avvengono sulla base delle Standard Contractual
            Clauses (SCC) approvate dalla Commissione Europea o di decisioni di adeguatezza
            (es. Data Privacy Framework UE-USA).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Durata dei cookie</h2>
          <p>
            La durata di ciascun cookie è indicata nelle tabelle sopra. In generale distinguiamo:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong>Cookie di sessione</strong>: cancellati alla chiusura del browser.
            </li>
            <li>
              <strong>Cookie persistenti</strong>: rimangono fino alla scadenza indicata o finché
              non li elimini manualmente.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <h2 className="text-xl font-semibold mb-3">5. Gestione e revoca del consenso</h2>
          <p className="mb-4">
            Puoi modificare o revocare il tuo consenso in qualsiasi momento. La revoca non
            pregiudica la liceità del trattamento basata sul consenso prestato precedentemente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={openPreferences}>Gestisci preferenze cookie</Button>
            <Button asChild variant="outline">
              <Link to="/privacy">Leggi la Privacy Policy</Link>
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Disabilitare i cookie dal browser</h2>
          <p className="mb-3">
            Puoi bloccare o eliminare i cookie anche tramite le impostazioni del tuo browser.
            Tieni presente che disabilitare i cookie tecnici può compromettere il funzionamento del
            Servizio (login, checkout, carrello).
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <a
                className="text-primary underline underline-offset-2"
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                className="text-primary underline underline-offset-2"
                href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                className="text-primary underline underline-offset-2"
                href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apple Safari
              </a>
            </li>
            <li>
              <a
                className="text-primary underline underline-offset-2"
                href="https://support.microsoft.com/it-it/microsoft-edge"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">7. I tuoi diritti</h2>
          <p>
            In qualità di interessato puoi esercitare i diritti previsti dagli artt. 15-22 GDPR
            (accesso, rettifica, cancellazione, limitazione, portabilità, opposizione) scrivendo a{" "}
            <a href="mailto:privacy@vireo.app" className="text-primary underline underline-offset-2">
              privacy@vireo.app
            </a>
            . Hai inoltre diritto di proporre reclamo al{" "}
            <a
              className="text-primary underline underline-offset-2"
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
            >
              Garante per la Protezione dei Dati Personali
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">8. Aggiornamenti</h2>
          <p>
            Ci riserviamo il diritto di modificare questa Cookie Policy in qualsiasi momento. In
            caso di modifiche sostanziali (es. introduzione di nuove categorie di cookie) ti
            chiederemo nuovamente il consenso tramite il banner.
          </p>
        </div>
      </section>
    </main>
  );
}

function CategoryBlock({
  title,
  status,
  statusVariant,
  description,
  base,
  rows,
  isActive,
}: {
  title: string;
  status: string;
  statusVariant: "default" | "secondary" | "outline";
  description: string;
  base: string;
  rows: CookieRow[];
  isActive: boolean;
}) {
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-semibold text-base">{title}</h3>
        <Badge variant={statusVariant}>{status}</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <p className="text-xs text-muted-foreground mb-4">
        <strong>Base giuridica:</strong> {base}
      </p>

      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Fornitore</TableHead>
                <TableHead>Finalità</TableHead>
                <TableHead>Durata</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-mono text-xs">{c.name}</TableCell>
                  <TableCell className="text-xs">{c.provider}</TableCell>
                  <TableCell className="text-xs">{c.purpose}</TableCell>
                  <TableCell className="text-xs">{c.duration}</TableCell>
                  <TableCell className="text-xs">{c.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          {isActive
            ? "Categoria attiva ma nessun cookie attualmente impostato."
            : "Nessun cookie di questa categoria è attualmente impostato."}
        </p>
      )}
    </div>
  );
}
