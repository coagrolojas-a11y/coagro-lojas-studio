#!/usr/bin/env node
/**
 * Repara mojibake (UTF-8 duplamente codificado) em arquivos de texto.
 *
 * Problema: bytes UTF-8 foram interpretados como Latin-1 e regravados como UTF-8.
 * Ex.: "ç" (C3 A7) virou "ç"; "Á" (C3 81) virou "Ã" + U+0081.
 *
 * Estratégia: para cada "run" de caracteres >= U+0080, tentamos interpretar a
 * sequência como uma representação Latin-1 de bytes UTF-8 válidos. Só repara
 * quando TODA a sequência parseia como UTF-8 válido (lead + bytes de continuação)
 * e decodifica sem U+FFFD. Texto já correto ("ção", "lote", "Ê") não parseia
 * como lead+continuação e portanto nunca é alterado.
 *
 * Uso:
 *   node scripts/fix-encoding.mjs              # aplica + gera relatório
 *   node scripts/fix-encoding.mjs --dry-run    # só mostra o relatório
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const REPORT = path.join(ROOT, 'reports', 'encoding-fix-report.md');

const EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.css', '.html', '.yml']);
const SKIP_DIRS = new Set(['node_modules', 'dist', 'dist_electron', '.git', 'coverage', 'reports', 'build']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) walk(full, out);
    } else if (EXT.has(path.extname(entry)) && path.basename(full) !== 'package-lock.json') {
      out.push(full);
    }
  }
  return out;
}

/**
 * Interpreta `run` como bytes UTF-8 representados como codepoints Latin-1.
 * @returns {string|null} texto corrigido, ou null se não for mojibake seguro.
 */
function decodeMojibake(run) {
  const bytes = [];
  let i = 0;
  while (i < run.length) {
    const c = run.codePointAt(i);
    if (c < 0x80) return null; // ASCII dentro do run é estranho
    let contCount;
    if (c >= 0xc0 && c <= 0xdf) contCount = 1;
    else if (c >= 0xe0 && c <= 0xef) contCount = 2;
    else if (c >= 0xf0 && c <= 0xf7) contCount = 3;
    else return null; // começa com byte de continuação -> não é mojibake
    bytes.push(c); // byte de início COMPLETO (0xC0-0xF7) — reconstruímos os bytes
                   // originais para alimentar Buffer.from; não devemos mascará-los.
    for (let k = 1; k <= contCount; k++) {
      const cc = run.charCodeAt(i + k);
      // charCodeAt devolve NaN fora da faixa (não undefined) — precisa do Number.isNaN,
      // senão NaN vira 0x00 no buffer e corrompe texto já correto.
      if (Number.isNaN(cc) || cc < 0x80 || cc > 0xbf) return null; // estrutura inválida
      bytes.push(cc);
      }
    i += contCount + 1;
  }
  const decoded = Buffer.from(bytes).toString('utf8');
  return decoded.includes('\uFFFD') ? null : decoded;
}

function repairLine(line) {
  let changed = false;
  const out = line.replace(/[\u0080-\u00f7]+/g, (run) => {
    const fixed = decodeMojibake(run);
    if (fixed === null || fixed === run) return run;
    changed = true;
    return fixed;
  });
  return changed ? out : null;
}

function repairText(text) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const diffs = [];
  const fixed = lines.map((line, idx) => {
    const repaired = repairLine(line);
    if (repaired !== null) {
      diffs.push({ line: idx + 1, before: line, after: repaired });
      return repaired;
    }
    return line;
  });
  return { text: fixed.join(eol), diffs, eol };
}

const files = walk(ROOT);
const report = ['# Relatório de reparo de encoding', ''];
let totalFiles = 0;
let totalLines = 0;

for (const file of files) {
  const raw = readFileSync(file);
  const text = raw.toString('utf8');
  if (text.includes('\uFFFD')) {
    report.push(`> ⚠️ \`${path.relative(ROOT, file)}\` contém bytes UTF-8 inválidos (U+FFFD) — revisar manualmente.`);
  }
  const { text: fixed, diffs } = repairText(text);
  if (diffs.length === 0) continue;
  totalFiles++;
  totalLines += diffs.length;
  report.push(`## \`${path.relative(ROOT, file)}\` — ${diffs.length} linha(s)`);
  for (const d of diffs) {
    report.push(`- **L${d.line}**`);
    report.push(`  - antes: \`${d.before.trim() || '(vazia)'}\``);
    report.push(`  - depois: \`${d.after.trim() || '(vazia)'}\``);
  }
  report.push('');
  if (!DRY) writeFileSync(file, fixed, 'utf8');
}

report.unshift(`**${totalFiles} arquivo(s), ${totalLines} linha(s) alterada(s)** — modo: ${DRY ? 'dry-run' : 'apply'}`, '');
mkdirSync(path.dirname(REPORT), { recursive: true });
writeFileSync(REPORT, report.join('\n'), 'utf8');
console.log(`${DRY ? '[dry-run]' : '[aplicado]'} ${totalFiles} arquivo(s), ${totalLines} linha(s). Relatório: ${path.relative(ROOT, REPORT)}`);
