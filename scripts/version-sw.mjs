#!/usr/bin/env node
/**
 * Carimba a versão do Service Worker no build (dist/sw.js).
 *
 * Motivo: `public/sw.js` tinha CACHE_NAME fixo 'coagro-studio-v1' para sempre,
 * então o handler `activate` nunca apagava os bundles antigos de /assets/
 * (cache-first sem expurgo) e um deploy offline podia servir HTML antigo.
 *
 * O build id é um hash do dist/index.html (que já contém os nomes com hash dos
 * bundles) — build idêntico => mesmo nome de cache => sem re-download à toa.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const swPath = path.join(root, 'dist', 'sw.js');
const indexPath = path.join(root, 'dist', 'index.html');

if (!existsSync(swPath)) {
  console.error('[version-sw] dist/sw.js não encontrado — rode `vite build` antes.');
  process.exit(1);
}

const buildId = existsSync(indexPath)
  ? createHash('sha256').update(readFileSync(indexPath)).digest('hex').slice(0, 8)
  : String(Date.now());

const sw = readFileSync(swPath, 'utf8');
const updated = sw.replace(
  /const CACHE_NAME = ['"][^'"]*['"]/,
  `const CACHE_NAME = 'coagro-studio-${buildId}'`
);

if (updated === sw && !sw.includes(`coagro-studio-${buildId}`)) {
  console.error('[version-sw] Padrão `const CACHE_NAME = ...` não encontrado em dist/sw.js');
  process.exit(1);
}

writeFileSync(swPath, updated, 'utf8');
console.log(`[version-sw] CACHE_NAME = coagro-studio-${buildId}`);
