import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold mb-2">Termini di Servizio</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <section className="space-y-6 text-sm leading-relaxed">
        <p>
          I presenti Termini di Servizio ("Termini") regolano l'utilizzo della piattaforma{" "}
          <strong>Vireo</strong> ("Servizio"). Utilizzando il Servizio accetti integralmente questi Termini.
        </p>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">1. Oggetto del Servizio</h2>
          <p>
            Vireo è una piattaforma dedicata al green lifestyle che offre: ricette plant-based, ricerca di
            ristoranti sostenibili, marketplace di prodotti eco, magic bag anti-spreco, meal plan generato
            da AI, community, e funzionalità premium tramite abbonamento.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">2. Account utente</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Devi avere almeno 16 anni per registrarti.</li>
            <li>Sei responsabile della riservatezza delle tue credenziali.</li>
            <li>Non puoi creare account multipli o impersonare altri utenti.</li>
            <li>Possiamo sospendere account in caso di violazione dei presenti Termini.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">3. Marketplace e venditori</h2>
          <p>
            Vireo agisce come piattaforma di intermediazione tra venditori indipendenti e clienti finali.
            La vendita avviene tra venditore e cliente; Vireo trattiene una commissione per ogni transazione.
            I venditori sono responsabili di:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Veridicità delle informazioni sui prodotti</li>
            <li>Spedizione e consegna entro i tempi indicati</li>
            <li>Gestione di resi, garanzie e diritto di recesso (D.lgs. 206/2005)</li>
            <li>Adempimenti fiscali sulla propria attività</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">4. Prenotazioni ristoranti</h2>
          <p>
            Le prenotazioni sono richieste inoltrate al ristorante, che ha facoltà di confermarle o
            rifiutarle. Vireo non garantisce la disponibilità del posto fino alla conferma da parte del
            ristorante.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">5. Abbonamenti Pro / Business</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gli abbonamenti si rinnovano automaticamente fino a disdetta.</li>
            <li>Puoi disdire in qualsiasi momento dal tuo profilo; il servizio resta attivo fino al termine del periodo pagato.</li>
            <li>Diritto di recesso: 14 giorni dall'attivazione, salvo utilizzo del servizio digitale (art. 59 Codice del Consumo).</li>
            <li>I prezzi possono variare con preavviso di 30 giorni.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">6. Contenuti generati dagli utenti</h2>
          <p>
            Pubblicando contenuti nella community o recensioni concedi a Vireo una licenza non esclusiva,
            gratuita e mondiale di utilizzo, riproduzione e pubblicazione all'interno del Servizio. Non
            sono ammessi contenuti illeciti, diffamatori, offensivi o che violino diritti di terzi.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">7. AI e Meal Plan</h2>
          <p>
            Le funzionalità AI (chat assistant, meal plan, traduzioni) sono fornite "as is" e hanno valore
            puramente informativo. <strong>Non sostituiscono il parere di un medico, nutrizionista o
            dietologo.</strong> Vireo non è responsabile di scelte alimentari o sanitarie basate su tali
            output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">8. Limitazione di responsabilità</h2>
          <p>
            Nei limiti consentiti dalla legge, Vireo non è responsabile per danni indiretti o consequenziali
            derivanti dall'utilizzo del Servizio. Resta salva la responsabilità per dolo o colpa grave.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">9. Proprietà intellettuale</h2>
          <p>
            Marchio, logo, design e codice del Servizio sono di proprietà di Vireo. È vietata la
            riproduzione senza autorizzazione scritta.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">10. Legge applicabile e foro</h2>
          <p>
            I presenti Termini sono regolati dalla legge italiana. Per i consumatori il foro competente è
            quello del consumatore. Per le controversie tra professionisti il foro esclusivo è Milano.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">11. Modifiche</h2>
          <p>
            Possiamo modificare questi Termini con preavviso di 30 giorni via email o avviso in-app. L'uso
            continuato del Servizio dopo la notifica costituisce accettazione delle modifiche.
          </p>
        </div>

        <p className="mt-8 text-muted-foreground">
          Vedi anche la nostra <Link to="/privacy" className="text-primary underline">Privacy Policy</Link> e la{" "}
          <Link to="/cookies" className="text-primary underline">Cookie Policy</Link>.
        </p>
      </section>
    </main>
  );
}
