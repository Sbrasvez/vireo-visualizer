# i18n Lint

Due script per prevenire regressioni i18n:

1. **`check-i18n.mjs`** — trova stringhe italiane hardcoded nei `.tsx`
2. **`check-i18n-keys.mjs`** — verifica che ogni chiave `t("...")` esista in tutti i 5 locale

## Uso

```bash
# 1) Stringhe hardcoded
node scripts/check-i18n.mjs            # scansiona src/
node scripts/check-i18n.mjs src/pages  # cartella specifica

# 2) Chiavi mancanti nei locale
node scripts/check-i18n-keys.mjs
node scripts/check-i18n-keys.mjs src/pages

# In CI: entrambi escono con codice 1 in caso di errori
node scripts/check-i18n.mjs && node scripts/check-i18n-keys.mjs
```

## check-i18n.mjs — stringhe hardcoded

Cerca parole italiane comuni (`Carrello`, `Riepilogo`, `Selezione`, `Prenotazioni`, `Subtotale`, `Spedizione`, `Totale`, `Panetteria`, `Pasto pronto`, `Sorpresa mista`, `Drogheria`, `Accedi`, `Riserva`, `Continua lo shopping`, `Procedi al checkout`, `Aggiungi al carrello`, `Disponibile`, `Esaurito`, `Gratis`, `Salva`, `Elimina`, `Modifica`, `Conferma`, `Annulla`, `Caricamento`, `Cerca`, `Filtra`, `Ordina`).

**Ignora**: commenti, import, stringhe già in `t("key", "fallback")`.

## check-i18n-keys.mjs — missing + orphans

Esegue **due check** sui locale:

1. **MISSING** — chiavi usate in `t("ns.key")` nel codice ma assenti in qualche locale
2. **ORPHAN** — chiavi presenti in `it.json` (locale di riferimento) ma **mai usate** nel codice

### Flag

```bash
node scripts/check-i18n-keys.mjs                 # entrambi i check
node scripts/check-i18n-keys.mjs --no-orphans    # solo missing
node scripts/check-i18n-keys.mjs --orphans-only  # solo orphans
node scripts/check-i18n-keys.mjs --strict        # exit 1 anche solo per orphans
node scripts/check-i18n-keys.mjs src/pages       # cartella specifica
```

### Exit code

| Scenario | Default | Con `--strict` |
|---|---|---|
| Missing trovate | 1 | 1 |
| Solo orphans trovate | 0 (warning) | 1 |
| Tutto pulito | 0 | 0 |

### Cosa estrae dal codice

- `t("ns.key")` / `t('ns.key')` / `` t(`ns.key`) `` → chiavi statiche
- `` t(`ns.${var}`) `` → registrato come **prefix dinamico** `"ns."`: tutte le chiavi sotto quel prefix sono considerate "usate" (no falsi positivi sugli orphans)

### Cosa ignora

- chiavi flat senza namespace (es. `t("Hello")`)
- chiavi dentro a commenti
- file di test
- varianti plurali (`_zero/_one/_two/_few/_many/_other`) — la chiave base le copre tutte

### Whitelist orphans

Per chiavi consumate dinamicamente in modi non rilevabili, aggiungile a `ORPHAN_WHITELIST` in `check-i18n-keys.mjs`.

### Output di esempio

```
✓ i18n missing: 644 chiavi uniche, tutte presenti in it/en/es/fr/de
⚠ i18n orphans: trovate 72 chiavi presenti in it.json ma MAI usate nel codice

  [cart] 3 orphans
    cart.free
    cart.selection_label
    cart.summary

  [profile] 7 orphans
    profile.bio
    ...

ℹ prefix dinamici registrati: green_score.levels, marketplace.categories, ...
```

## Estendere

- Aggiungi parole hardcoded all'array `FORBIDDEN_WORDS` in `check-i18n.mjs`.
- Aggiungi locale all'array `LOCALES` in `check-i18n-keys.mjs` quando supporti nuove lingue.
