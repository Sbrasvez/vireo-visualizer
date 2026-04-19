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

## check-i18n-keys.mjs — chiavi mancanti

Estrae tutte le chiavi statiche da `t("namespace.key")` / `t('namespace.key')` / `` t(`namespace.key`) `` nei file `.ts`/`.tsx` e verifica che esistano in `src/i18n/locales/{it,en,es,fr,de}.json`.

**Ignora**:
- chiavi dinamiche (es. `t(variable)`, `` t(`prefix.${x}`) ``)
- chiavi flat senza namespace (es. `t("Hello")`)
- chiavi dentro a commenti
- file di test

**Pluralizzazione**: una chiave `cart.eyebrow` è considerata presente se nel locale esiste `cart.eyebrow` o una variante plurale (`_zero`, `_one`, `_two`, `_few`, `_many`, `_other`).

**Output di esempio**:
```
✗ i18n keys lint: trovate 3 chiavi mancanti

  "cart.checkout_btn"
    mancante in: en, es, fr, de
    usata in:
      src/pages/Cart.tsx:173
```

## Estendere

- Aggiungi parole hardcoded all'array `FORBIDDEN_WORDS` in `check-i18n.mjs`.
- Aggiungi locale all'array `LOCALES` in `check-i18n-keys.mjs` quando supporti nuove lingue.
