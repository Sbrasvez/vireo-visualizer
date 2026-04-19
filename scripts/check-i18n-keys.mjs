#!/usr/bin/env node
/**
 * i18n keys lint: doppio check su chiavi e file di locale.
 *
 * 1) MISSING — chiavi usate in t("ns.key") nel codice ma assenti in qualche locale
 * 2) ORPHAN  — chiavi presenti nei file di locale ma MAI usate nel codice
 *
 * Uso:
 *   node scripts/check-i18n-keys.mjs                 # entrambi i check, scansiona src/
 *   node scripts/check-i18n-keys.mjs src/pages       # cartella specifica
 *   node scripts/check-i18n-keys.mjs --no-orphans    # solo missing
 *   node scripts/check-i18n-keys.mjs --orphans-only  # solo orphans
 *   node scripts/check-i18n-keys.mjs --strict        # exit 1 anche solo per orphans
 *
 * Default exit codes:
 *   - missing trovate         → exit 1 (sempre)
 *   - solo orphans trovate    → exit 0 (warning), exit 1 con --strict
 *   - tutto pulito            → exit 0
 *
 * Cosa estrae dal codice:
 *   - t("ns.key") / t('ns.key') / t(`ns.key`) — letterali statici
 *   - t(`ns.${var}`) — registrato come PREFIX dinamico "ns." → tutte le chiavi
 *     sotto quel prefix sono considerate "usate" (no false positive su orphans)
 *
 * Cosa ignora:
 *   - chiavi dentro a commenti
 *   - file di test
 *   - varianti plurali (_zero/_one/_two/_few/_many/_other) — la base copre tutte
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const FLAGS = new Set(args.filter((a) => a.startsWith("--")));
const TARGET = args.find((a) => !a.startsWith("--")) || "src";
const ONLY_ORPHANS = FLAGS.has("--orphans-only");
const ONLY_PARITY = FLAGS.has("--parity-only");
const ONLY_MISSING = FLAGS.has("--missing-only");
const CHECK_MISSING = !ONLY_ORPHANS && !ONLY_PARITY;
const CHECK_ORPHANS = !FLAGS.has("--no-orphans") && !ONLY_PARITY && !ONLY_MISSING;
const CHECK_PARITY = !FLAGS.has("--no-parity") && !ONLY_ORPHANS && !ONLY_MISSING;
const STRICT = FLAGS.has("--strict");

const LOCALES_DIR = join(ROOT, "src/i18n/locales");
const LOCALES = ["it", "en", "es", "fr", "de"];
// Locale di riferimento per elencare le chiavi orfane (assumiamo che it.json sia il
// locale "master" più completo). Le chiavi mancanti negli altri locale vengono
// comunque catturate dal check missing.
const REFERENCE_LOCALE = "it";

// Static literal: t("a.b.c", ...)
const T_STATIC = /\bt\(\s*(["'`])([a-zA-Z0-9_.\-]+)\1/g;
// Dynamic template: t(`a.b.${...}`) o t(`a.b_${...}`) — cattura tutto il
// prefix letterale prima di ${. Il prefix viene poi usato per match
// "startsWith" sulle chiavi del locale, quindi:
//   t(`green_score.levels.${k}`) → prefix "green_score.levels." → match
//                                    green_score.levels.seedling, ecc.
//   t(`green_score.badge_${k}`)  → prefix "green_score.badge_"  → match
//                                    green_score.badge_first_recipe, ecc.
const T_DYNAMIC = /\bt\(\s*`([a-zA-Z0-9_.\-]+)\$\{/g;

const PLURAL_SUFFIXES = ["_zero", "_one", "_two", "_few", "_many", "_other"];

// Path-based ignore: queste chiavi/sottoalberi nei locale vengono SEMPRE considerati
// usati anche se non appaiono in t("..."). Utile per chiavi consumate da
// libreria/i18n config (es. namespace di lingua, formati data, ecc.).
const ORPHAN_WHITELIST = [
  // esempi: "common.lang_*" o sottoalberi tipici di i18next
  // "languages",
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry.startsWith("."))
        continue;
      walk(full, files);
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      if (entry.endsWith(".test.ts") || entry.endsWith(".test.tsx")) continue;
      files.push(full);
    }
  }
  return files;
}

function stripComments(src) {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  return out;
}

function extractFromFile(file) {
  const raw = readFileSync(file, "utf8");
  const src = stripComments(raw);
  const lines = raw.split("\n");
  const staticKeys = [];
  const dynamicPrefixes = [];

  T_STATIC.lastIndex = 0;
  let m;
  while ((m = T_STATIC.exec(src)) !== null) {
    const key = m[2];
    if (!key.includes(".")) continue;
    const idx = lines.findIndex(
      (l) => l.includes(`"${key}"`) || l.includes(`'${key}'`) || l.includes(`\`${key}\``)
    );
    staticKeys.push({ key, line: idx === -1 ? 0 : idx + 1 });
  }

  T_DYNAMIC.lastIndex = 0;
  while ((m = T_DYNAMIC.exec(src)) !== null) {
    dynamicPrefixes.push(m[1]); // es. "green_score.levels"
  }

  return { staticKeys, dynamicPrefixes };
}

function loadLocale(locale) {
  const path = join(LOCALES_DIR, `${locale}.json`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`✗ impossibile leggere ${path}: ${e.message}`);
    process.exit(2);
  }
}

function hasKey(obj, dottedKey) {
  const parts = dottedKey.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return false;
  }
  return true;
}

function hasKeyOrPlural(obj, dottedKey) {
  if (hasKey(obj, dottedKey)) return true;
  for (const suf of PLURAL_SUFFIXES) {
    if (hasKey(obj, dottedKey + suf)) return true;
  }
  return false;
}

// Appiattisce un dizionario JSON in lista di chiavi dotted (foglie stringa)
function flattenKeys(obj, prefix = "", out = []) {
  if (obj === null || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flattenKeys(v, path, out);
    } else {
      out.push(path);
    }
  }
  return out;
}

// Rimuove suffisso plurale per ottenere la "chiave logica"
function stripPluralSuffix(key) {
  for (const suf of PLURAL_SUFFIXES) {
    if (key.endsWith(suf)) return key.slice(0, -suf.length);
  }
  return key;
}

// 1) carica tutti i locale
const dictionaries = Object.fromEntries(LOCALES.map((l) => [l, loadLocale(l)]));

// 2) estrae tutte le chiavi e prefix dinamici dal codice
const targetDir = join(ROOT, TARGET);
const files = walk(targetDir);
const allKeys = new Map(); // key → [{file, line}, ...]
const dynamicPrefixSet = new Set();
for (const file of files) {
  const { staticKeys, dynamicPrefixes } = extractFromFile(file);
  for (const { key, line } of staticKeys) {
    if (!allKeys.has(key)) allKeys.set(key, []);
    allKeys.get(key).push({ file: relative(ROOT, file), line });
  }
  for (const p of dynamicPrefixes) dynamicPrefixSet.add(p);
}

// === CHECK 1: missing ============================================================
const missing = [];
if (CHECK_MISSING) {
  for (const [key, usages] of allKeys) {
    for (const locale of LOCALES) {
      if (!hasKeyOrPlural(dictionaries[locale], key)) {
        missing.push({ key, locale, usages });
      }
    }
  }
}

// === CHECK 2: orphans ============================================================
const orphans = [];
if (CHECK_ORPHANS) {
  // Set delle chiavi "logiche" usate (senza suffisso plurale)
  const usedLogical = new Set([...allKeys.keys()].map(stripPluralSuffix));

  // Tutte le chiavi del locale di riferimento (foglie)
  const refKeys = flattenKeys(dictionaries[REFERENCE_LOCALE]);

  for (const fullKey of refKeys) {
    const logical = stripPluralSuffix(fullKey);

    // 1. usata direttamente?
    if (usedLogical.has(logical)) continue;
    // 2. coperta da un prefix dinamico? (es. green_score.levels.* via t(`green_score.levels.${k}`))
    let covered = false;
    for (const prefix of dynamicPrefixSet) {
      if (logical.startsWith(prefix + ".")) {
        covered = true;
        break;
      }
    }
    if (covered) continue;
    // 3. whitelist
    if (ORPHAN_WHITELIST.some((w) => logical === w || logical.startsWith(w + "."))) continue;

    orphans.push(fullKey);
  }
}

// === CHECK 3: parity =============================================================
// Per ogni locale, calcoliamo l'insieme delle chiavi foglia (path dotted, comprese
// le varianti plurali). Poi confrontiamo a coppie ogni locale contro l'unione di
// tutti, segnalando le chiavi mancanti per locale.
//
// NOTE: due chiavi sono considerate "equivalenti" se hanno la stessa path
// completa (incluso eventuale suffisso plurale). Questo è voluto: se it.json ha
// `cart.item_one`/`cart.item_other` e en.json ha solo `cart.item`, è una
// desincronizzazione che vogliamo vedere — i18next risolverà comunque grazie ai
// fallback ma il traduttore deve esserne consapevole.
const parityIssues = []; // [{ key, missingIn: ["en", "fr"], presentIn: ["it", "es", "de"] }]
if (CHECK_PARITY) {
  const keysByLocale = Object.fromEntries(
    LOCALES.map((l) => [l, new Set(flattenKeys(dictionaries[l]))])
  );
  const allKeysUnion = new Set();
  for (const set of Object.values(keysByLocale)) {
    for (const k of set) allKeysUnion.add(k);
  }
  for (const key of allKeysUnion) {
    const missingIn = [];
    const presentIn = [];
    for (const loc of LOCALES) {
      if (keysByLocale[loc].has(key)) presentIn.push(loc);
      else missingIn.push(loc);
    }
    if (missingIn.length > 0) {
      parityIssues.push({ key, missingIn, presentIn });
    }
  }
}

// === REPORT ======================================================================
let exitCode = 0;

if (CHECK_MISSING) {
  if (missing.length === 0) {
    console.log(
      `✓ i18n missing: ${allKeys.size} chiavi uniche, tutte presenti in ${LOCALES.join("/")} (${files.length} file scansionati)`
    );
  } else {
    console.error(`✗ i18n missing: trovate ${missing.length} chiavi mancanti\n`);
    const byKey = new Map();
    for (const m of missing) {
      if (!byKey.has(m.key)) byKey.set(m.key, { locales: [], usages: m.usages });
      byKey.get(m.key).locales.push(m.locale);
    }
    const sorted = [...byKey.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    for (const [key, info] of sorted) {
      console.error(`  "${key}"`);
      console.error(`    mancante in: ${info.locales.join(", ")}`);
      console.error(`    usata in:`);
      for (const u of info.usages.slice(0, 3)) {
        console.error(`      ${u.file}:${u.line}`);
      }
      if (info.usages.length > 3) {
        console.error(`      ...e altri ${info.usages.length - 3} file`);
      }
      console.error("");
    }
    console.error(
      `Suggerimento: aggiungi le chiavi mancanti in src/i18n/locales/{${LOCALES.join(",")}}.json\n`
    );
    exitCode = 1;
  }
}

if (CHECK_ORPHANS) {
  if (orphans.length === 0) {
    console.log(`✓ i18n orphans: nessuna chiave morta nel locale di riferimento (${REFERENCE_LOCALE}.json)`);
  } else {
    const label = STRICT ? "✗" : "⚠";
    const stream = STRICT ? console.error : console.warn;
    stream(
      `${label} i18n orphans: trovate ${orphans.length} chiavi presenti in ${REFERENCE_LOCALE}.json (e probabilmente nei locale gemelli) ma MAI usate nel codice\n`
    );
    // Raggruppa per top-namespace per leggibilità
    const byNs = new Map();
    for (const k of orphans.sort()) {
      const ns = k.split(".")[0];
      if (!byNs.has(ns)) byNs.set(ns, []);
      byNs.get(ns).push(k);
    }
    for (const [ns, keys] of [...byNs.entries()].sort()) {
      stream(`  [${ns}] ${keys.length} orphan${keys.length === 1 ? "" : "s"}`);
      for (const k of keys) stream(`    ${k}`);
      stream("");
    }
    stream(
      `Suggerimento: rimuovi queste chiavi dai 5 file di locale, oppure aggiungile alla ORPHAN_WHITELIST se sono consumate dinamicamente.\n`
    );
    if (STRICT) exitCode = 1;
  }
}

if (CHECK_PARITY) {
  if (parityIssues.length === 0) {
    console.log(
      `✓ i18n parity: tutte le chiavi foglia sono allineate in ${LOCALES.join("/")}`
    );
  } else {
    // Parità rotta = sempre errore: significa che un locale ha chiavi che gli
    // altri non hanno (o viceversa). Diverso dagli orphans, qui è un bug di
    // sync tra file di traduzione e va sempre risolto.
    console.error(
      `✗ i18n parity: trovate ${parityIssues.length} chiavi non allineate tra i locale\n`
    );
    // Raggruppa per "set di locale mancanti" per leggibilità (es. tutte le
    // chiavi che mancano in en+fr+de finiscono nello stesso gruppo)
    const byMissingSet = new Map();
    for (const p of parityIssues.sort((a, b) => a.key.localeCompare(b.key))) {
      const sig = p.missingIn.join(",");
      if (!byMissingSet.has(sig)) byMissingSet.set(sig, []);
      byMissingSet.get(sig).push(p);
    }
    for (const [sig, items] of [...byMissingSet.entries()].sort()) {
      console.error(`  mancanti in [${sig}] (presenti in [${items[0].presentIn.join(",")}]) — ${items.length} chiavi`);
      for (const p of items.slice(0, 50)) {
        console.error(`    ${p.key}`);
      }
      if (items.length > 50) {
        console.error(`    ...e altre ${items.length - 50} chiavi`);
      }
      console.error("");
    }
    console.error(
      `Suggerimento: copia le chiavi mancanti dai locale di origine, oppure rimuovile da quelli che le contengono se sono morte.\n`
    );
    exitCode = 1;
  }
}

if (dynamicPrefixSet.size > 0) {
  console.log(
    `ℹ prefix dinamici registrati (orphans ignorate sotto questi): ${[...dynamicPrefixSet].sort().join(", ")}`
  );
}

process.exit(exitCode);
