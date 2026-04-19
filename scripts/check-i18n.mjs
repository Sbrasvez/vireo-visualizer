#!/usr/bin/env node
/**
 * i18n lint: cerca stringhe italiane hardcoded nei file .tsx
 *
 * Uso:
 *   node scripts/check-i18n.mjs            # scansiona src/
 *   node scripts/check-i18n.mjs src/pages  # scansiona una cartella specifica
 *
 * Esce con codice 1 se trova match (utile per CI).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGET = process.argv[2] || "src";

// Parole/frasi italiane che NON devono apparire hardcoded nei .tsx
// (devono passare da i18n con t("..."))
const FORBIDDEN_WORDS = [
  "Carrello",
  "Riepilogo",
  "Selezione",
  "Prenotazioni",
  "Subtotale",
  "Spedizione",
  "Totale",
  "Panetteria",
  "Pasto pronto",
  "Sorpresa mista",
  "Drogheria",
  "Accedi",
  "Riserva",
  "Continua lo shopping",
  "Niente nel carrello",
  "Procedi al checkout",
  "Aggiungi al carrello",
  "Disponibile",
  "Esaurito",
  "Gratis",
  "Salva",
  "Elimina",
  "Modifica",
  "Conferma",
  "Annulla",
  "Caricamento",
  "Cerca",
  "Filtra",
  "Ordina",
];

// Pattern: parola bordata da non-lettere, case sensitive
const PATTERN = new RegExp(
  `(?<![A-Za-zÀ-ÿ])(${FORBIDDEN_WORDS.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("|")})(?![A-Za-zÀ-ÿ])`,
  "g"
);

// Linee da ignorare (commenti, import, stringhe i18n key, etc.)
function shouldSkipLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("//")) return true;
  if (trimmed.startsWith("*")) return true;
  if (trimmed.startsWith("import ")) return true;
  if (trimmed.startsWith("from ")) return true;
  return false;
}

// Salta match dentro a t("...", "fallback") — fallback i18n è ok
function isInsideTFallback(line, matchIndex) {
  const before = line.slice(0, matchIndex);
  // cerca l'ultimo t( aperto prima del match
  const tCallStart = before.lastIndexOf("t(");
  if (tCallStart === -1) return false;
  // controlla che non sia chiuso prima del match
  const between = before.slice(tCallStart);
  let depth = 0;
  for (const ch of between) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
  }
  return depth > 0;
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry.startsWith("."))
        continue;
      walk(full, files);
    } else if (entry.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

const targetDir = join(ROOT, TARGET);
const files = walk(targetDir);
const findings = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (shouldSkipLine(line)) return;
    let m;
    PATTERN.lastIndex = 0;
    while ((m = PATTERN.exec(line)) !== null) {
      if (isInsideTFallback(line, m.index)) continue;
      findings.push({
        file: relative(ROOT, file),
        line: i + 1,
        col: m.index + 1,
        word: m[1],
        snippet: line.trim().slice(0, 120),
      });
    }
  });
}

if (findings.length === 0) {
  console.log(`✓ i18n lint: nessuna stringa italiana hardcoded trovata in ${TARGET}/ (${files.length} file .tsx scansionati)`);
  process.exit(0);
}

console.error(`✗ i18n lint: trovate ${findings.length} stringhe italiane hardcoded:\n`);
const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}
for (const [file, list] of byFile) {
  console.error(`  ${file}`);
  for (const f of list) {
    console.error(`    L${f.line}:${f.col}  "${f.word}"  →  ${f.snippet}`);
  }
  console.error("");
}
console.error(`Suggerimento: avvolgi le stringhe con t("namespace.key", "fallback") e aggiungi le traduzioni in src/i18n/locales/*.json`);
process.exit(1);
