import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Button } from "@/components/ui/button";

export default function Cookies() {
  const { openPreferences } = useCookieConsent();

  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <section className="space-y-6 text-sm leading-relaxed">
        <p>
          Questa Cookie Policy spiega come <strong>Vireo</strong> utilizza cookie e tecnologie simili
          quando visiti la piattaforma, in conformità alle Linee Guida del Garante Privacy del 10 giugno 2021.
        </p>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo memorizzati sul tuo dispositivo che ci permettono di
            riconoscerti, ricordare le tue preferenze e migliorare la tua esperienza.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">Cookie tecnici (necessari)</h2>
          <p>
            Indispensabili per il funzionamento del sito. <strong>Non richiedono consenso.</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><code>sb-*</code> — Sessione di autenticazione Supabase</li>
            <li><code>vireo-cookie-consent</code> — Memorizza le tue preferenze cookie</li>
            <li><code>i18nextLng</code> — Lingua selezionata</li>
            <li><code>vireo-cart</code> — Carrello marketplace</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">Cookie di terze parti</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Stripe</strong> — pagamenti sicuri e prevenzione frodi (necessari per il checkout)</li>
            <li><strong>Mapbox</strong> — visualizzazione mappe ristoranti</li>
            <li><strong>Google</strong> — login OAuth opzionale</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">Cookie analitici</h2>
          <p>
            Attualmente Vireo <strong>non utilizza</strong> cookie analitici o di profilazione di terze
            parti. Se in futuro li introdurremo, ti chiederemo un nuovo consenso esplicito.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">Gestione delle preferenze</h2>
          <p className="mb-3">
            Puoi modificare in ogni momento le tue scelte cliccando il pulsante qui sotto.
          </p>
          <Button onClick={openPreferences} variant="outline">
            Gestisci preferenze cookie
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">Disabilitare i cookie dal browser</h2>
          <p>
            Puoi anche bloccare o eliminare i cookie tramite le impostazioni del tuo browser. Tieni presente
            che disabilitare i cookie tecnici potrebbe compromettere il funzionamento del Servizio.
          </p>
        </div>
      </section>
    </main>
  );
}
