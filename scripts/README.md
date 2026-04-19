# i18n Lint

Script per prevenire regressioni i18n: trova stringhe italiane hardcoded nei file `.tsx`.

## Uso

```bash
# Scansiona tutto src/
node scripts/check-i18n.mjs

# Scansiona una cartella specifica
node scripts/check-i18n.mjs src/pages

# In CI (esce con codice 1 se trova match)
node scripts/check-i18n.mjs && echo "OK" || exit 1
```

## Cosa cerca

Parole italiane comuni che dovrebbero essere wrappate in `t("...")`:
`Carrello`, `Riepilogo`, `Selezione`, `Prenotazioni`, `Subtotale`, `Spedizione`,
`Totale`, `Panetteria`, `Pasto pronto`, `Sorpresa mista`, `Drogheria`, `Accedi`,
`Riserva`, `Continua lo shopping`, `Procedi al checkout`, `Aggiungi al carrello`,
`Disponibile`, `Esaurito`, `Gratis`, `Salva`, `Elimina`, `Modifica`, `Conferma`,
`Annulla`, `Caricamento`, `Cerca`, `Filtra`, `Ordina`.

## Cosa ignora

- Commenti (`//`, `*`)
- Import statements
- Stringhe già dentro `t("key", "fallback")` (i fallback i18n sono ok)

## Estendere

Aggiungi parole all'array `FORBIDDEN_WORDS` in `scripts/check-i18n.mjs`.

## Output di esempio

```
✗ i18n lint: trovate 2 stringhe italiane hardcoded:

  src/pages/Cart.tsx
    L151:21  "Riepilogo"  →  Riepilogo
    L161:70  "Gratis"  →  {shippingCents > 0 ? formatEur(shippingCents) : "Gratis"}
```
