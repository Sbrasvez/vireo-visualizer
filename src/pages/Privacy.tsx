import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <main className="container max-w-3xl py-16 prose prose-neutral dark:prose-invert">
      <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <section className="space-y-6 text-sm leading-relaxed">
        <p>
          La presente Informativa sulla Privacy descrive come <strong>Vireo</strong> ("noi", "Titolare")
          raccoglie, utilizza e protegge i tuoi dati personali in conformità al Regolamento (UE) 2016/679
          ("GDPR") e al D.lgs. 196/2003 e successive modifiche.
        </p>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">1. Titolare del trattamento</h2>
          <p>
            Vireo — Email: <a href="mailto:privacy@vireo.app" className="text-primary underline">privacy@vireo.app</a>
            <br />
            Per qualsiasi richiesta relativa ai tuoi dati personali puoi scriverci all'indirizzo sopra indicato.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">2. Dati raccolti</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Dati account:</strong> email, password (cifrata), nome visualizzato, avatar.</li>
            <li><strong>Dati di utilizzo:</strong> ricette salvate, prodotti acquistati, prenotazioni ristoranti, lista della spesa, post nella community.</li>
            <li><strong>Dati di pagamento:</strong> gestiti esclusivamente da Stripe (Stripe Inc.). Non memorizziamo dati di carte di credito.</li>
            <li><strong>Dati tecnici:</strong> indirizzo IP, tipo di browser, log di accesso, cookie tecnici.</li>
            <li><strong>Dati AI:</strong> messaggi inviati alla chat AI e al Meal Plan AI.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">3. Finalità e base giuridica</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Erogazione del servizio</strong> (art. 6.1.b GDPR — esecuzione del contratto).</li>
            <li><strong>Adempimenti fiscali e contabili</strong> (art. 6.1.c GDPR — obbligo di legge).</li>
            <li><strong>Sicurezza e prevenzione frodi</strong> (art. 6.1.f GDPR — legittimo interesse).</li>
            <li><strong>Comunicazioni di marketing</strong> (art. 6.1.a GDPR — consenso, revocabile in qualsiasi momento).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">4. Destinatari dei dati</h2>
          <p>I tuoi dati possono essere trattati da fornitori che agiscono come responsabili del trattamento:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> (hosting database e autenticazione) — server UE.</li>
            <li><strong>Stripe</strong> (pagamenti) — conforme PCI DSS.</li>
            <li><strong>Mapbox</strong> (mappe geografiche).</li>
            <li><strong>Lovable AI Gateway</strong> (modelli AI per chat e meal plan).</li>
            <li><strong>Google</strong> (autenticazione OAuth, opzionale).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">5. Trasferimenti extra-UE</h2>
          <p>
            Alcuni fornitori (es. Stripe, Google) possono trattare dati negli Stati Uniti. I trasferimenti
            avvengono sulla base delle <em>Standard Contractual Clauses</em> approvate dalla Commissione Europea
            o del <em>Data Privacy Framework</em>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">6. Conservazione</h2>
          <p>
            I dati dell'account sono conservati finché il tuo profilo è attivo. I dati fiscali (ordini,
            fatture) sono conservati per 10 anni come previsto dalla normativa italiana. I log di sicurezza
            per 12 mesi.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">7. I tuoi diritti</h2>
          <p>Ai sensi degli artt. 15-22 GDPR hai diritto di:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Accedere ai tuoi dati personali</li>
            <li>Rettificarli o aggiornarli</li>
            <li>Cancellarli (diritto all'oblio)</li>
            <li>Limitarne il trattamento</li>
            <li>Riceverli in formato portabile</li>
            <li>Opporti al trattamento</li>
            <li>Revocare il consenso in qualsiasi momento</li>
            <li>Proporre reclamo al <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary underline">Garante per la Protezione dei Dati Personali</a></li>
          </ul>
          <p className="mt-2">
            Per esercitare i tuoi diritti scrivi a{" "}
            <a href="mailto:privacy@vireo.app" className="text-primary underline">privacy@vireo.app</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">8. Cookie</h2>
          <p>
            Per informazioni dettagliate sui cookie utilizzati consulta la nostra{" "}
            <Link to="/cookies" className="text-primary underline">Cookie Policy</Link>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">9. Modifiche</h2>
          <p>
            Ci riserviamo il diritto di aggiornare questa informativa. Le modifiche saranno comunicate
            via email o tramite avviso nell'app.
          </p>
        </div>
      </section>
    </main>
  );
}
