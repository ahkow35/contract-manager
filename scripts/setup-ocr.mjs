/* Stage Tesseract OCR engine files SAME-ORIGIN under public/ocr (no CDN at runtime — PDPA).
 * Copies the worker + core wasm from node_modules and downloads the English language data.
 * Idempotent. Runs automatically before `next build` (prebuild) and via `npm run setup:ocr`. */

import { mkdirSync, copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'ocr');
const langDir = join(outDir, 'lang');
mkdirSync(langDir, { recursive: true });

const copies = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'public/ocr/worker.min.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm', 'public/ocr/tesseract-core-simd-lstm.wasm'],
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm', 'public/ocr/tesseract-core-lstm.wasm'],
];
for (const [from, to] of copies) {
  const src = join(root, from);
  if (!existsSync(src)) {
    console.error(`[setup-ocr] missing ${from} — run \`npm install\` first.`);
    process.exit(1);
  }
  copyFileSync(src, join(root, to));
  console.log(`[setup-ocr] copied ${to}`);
}

const TRAINEDDATA = join(langDir, 'eng.traineddata.gz');
const TRAINEDDATA_URL = 'https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz';
if (existsSync(TRAINEDDATA)) {
  console.log('[setup-ocr] eng.traineddata.gz already present — skipping download.');
} else {
  console.log(`[setup-ocr] downloading eng.traineddata.gz …`);
  const res = await fetch(TRAINEDDATA_URL);
  if (!res.ok) {
    console.error(`[setup-ocr] download failed (${res.status}). Place eng.traineddata.gz in public/ocr/lang/ manually.`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(TRAINEDDATA, buf);
  console.log(`[setup-ocr] wrote eng.traineddata.gz (${(buf.length / 1e6).toFixed(1)} MB)`);
}
console.log('[setup-ocr] done.');
