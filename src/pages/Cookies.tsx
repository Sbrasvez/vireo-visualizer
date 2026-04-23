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
  const { openPreferences, consent } = useCookieConsent();

  return (
    <main className="container max-w-4xl py-16">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">
          Ultimo aggiornamento:{" "}
          {new Date().toLocaleDateString("it-IT", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

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

        <div>
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
              status={consent?.analytics ? "Attivi" : "Non in uso"}
              statusVariant="secondary"
              description="Ci aiuterebbero a capire in forma aggregata come gli utenti usano il sito. Attualmente Vireo NON utilizza alcun cookie analitico o di profilazione di terze parti. Se in futuro li introdurremo, ti chiederemo un nuovo consenso esplicito."
              base="Consenso (art. 6.1.a GDPR)"
              rows={[]}
              isActive={false}
            />

            <CategoryBlock
              title="Cookie marketing"
              status={consent?.marketing ? "Attivi" : "Non in uso"}
              statusVariant="secondary"
              description="Servirebbero a personalizzare comunicazioni pubblicitarie. Attualmente NON in uso."
              base="Consenso (art. 6.1.a GDPR)"
              rows={[]}
              isActive={false}
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
