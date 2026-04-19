#!/usr/bin/env node
/**
 * i18n keys lint: verifica che ogni chiave usata in t("namespace.key")
 * esista in TUTTI i file di locale (it/en/es/fr/de).
 *
 * Uso:
 *   node scripts/check-i18n-keys.mjs
 *   node scripts/check-i18n-keys.mjs src/pages
 *
 * Esce con codice 1 se trova chiavi mancanti (utile per CI).
 *
 * Cosa controlla:
 *  - estrae tutte le chiavi t("...") / t('...') / t(`...`) dai file .ts/.tsx
 *  - verifica che ogni chiave esista in TUTTI i 5 locale
 *  - segnala chiavi mancanti, locale per locale
 *
 * Cosa ignora:
 *  - chiavi dinamiche (es. t(variable), t(`prefix.${x}`))
 *  - chiavi dentro a commenti
 *  - i18n pluralization suffixes (_one, _other, _zero, _two, _few, _many)
 *    → la chiave base è considerata presente se esiste una qualsiasi variante
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGET = process.argv[2] || "src";
const LOCALES_DIR = join(ROOT, "src/i18n/locales");
const LOCALES = ["it", "en", "es", "fr", "de"];

// Match t("key.sub", ...) | t('key.sub', ...) | t(`key.sub`, ...)
// Solo letterali statici, no template con interpolazione
const T_CALL = /\bt\(\s*(["'`])([a-zA-Z0-9_.\-]+)\1/g;

const PLURAL_SUFFIXES = ["_zero", "_one", "_two", "_few", "_many", "_other"];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry.startsWith("."))
        continue;
      walk(full, files);
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      // skip test/setup files
      if (entry.endsWith(".test.ts") || entry.endsWith(".test.tsx")) continue;
      files.push(full);
    }
  }
  return files;
}

// Strip line comments e block comments per evitare falsi positivi
function stripComments(src) {
  // rimuove /* ... */ (anche multilinea)
  let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
  // rimuove // ... fino a fine riga
  out = out.replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  return out;
}

function extractKeysFromFile(file) {
  const src = stripComments(readFileSync(file, "utf8"));
  const keys = [];
  // ricava numero di riga per ogni match: serve un secondo passaggio per le posizioni reali
  const lines = readFileSync(file, "utf8").split("\n");
  T_CALL.lastIndex = 0;
  let m;
  while ((m = T_CALL.exec(src)) !== null) {
    const key = m[2];
    if (!key.includes(".")) continue; // chiavi flat (es. t("Hello")) non sono namespaced → skip
    // trova il numero di riga reale cercando la prima occorrenza nel file originale
    const idx = lines.findIndex((l) => l.includes(`"${key}"`) || l.includes(`'${key}'`) || l.includes(`\`${key}\``));
    keys.push({ key, line: idx === -1 ? 0 : idx + 1 });
  }
  return keys;
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
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p];
    } else {
      return false;
    }
  }
  return true;
}

// La chiave esiste se: esiste come tale OR esiste una variante plurale (key_one, key_other, ...)
function hasKeyOrPlural(obj, dottedKey) {
  if (hasKey(obj, dottedKey)) return true;
  for (const suf of PLURAL_SUFFIXES) {
    if (hasKey(obj, dottedKey + suf)) return true;
  }
  return false;
}

// 1) carica tutti i locale
const dictionaries = Object.fromEntries(LOCALES.map((l) => [l, loadLocale(l)]));

// 2) estrae tutte le chiavi dal codice
const targetDir = join(ROOT, TARGET);
const files = walk(targetDir);
const allKeys = new Map(); // key → [{file, line}, ...]
for (const file of files) {
  const keys = extractKeysFromFile(file);
  for (const { key, line } of keys) {
    if (!allKeys.has(key)) allKeys.set(key, []);
    allKeys.get(key).push({ file: relative(ROOT, file), line });
  }
}

// 3) verifica presenza in ogni locale
const missing = []; // {key, locale, usages}
for (const [key, usages] of allKeys) {
  for (const locale of LOCALES) {
    if (!hasKeyOrPlural(dictionaries[locale], key)) {
      missing.push({ key, locale, usages });
    }
  }
}

if (missing.length === 0) {
  console.log(
    `✓ i18n keys lint: ${allKeys.size} chiavi uniche, tutte presenti in ${LOCALES.join("/")} (${files.length} file scansionati)`
  );
  process.exit(0);
}

// Raggruppa output per chiave
console.error(`✗ i18n keys lint: trovate ${missing.length} chiavi mancanti\n`);
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
  `Suggerimento: aggiungi le chiavi mancanti in src/i18n/locales/{${LOCALES.join(",")}}.json`
);
process.exit(1);
