/* Pure extraction from raw OCR text. ID-number patterns are reliable and unit-tested; name/address
 * are best-effort heuristics (card-layout dependent) — always operator-verified, never authoritative. */

import type { Jurisdiction } from '../merge/types';

export interface OcrExtract {
  nric?: string;
  name?: string;
  address?: string;
}

const SG_NRIC = /\b([STFGM]\d{7}[A-Z])\b/i;
// MyKad: 6 digits (YYMMDD) - 2 (place) - 4 (serial). Allow spaces/dashes from OCR noise.
const MY_KAD = /\b(\d{6}[-\s]?\d{2}[-\s]?\d{4})\b/;

const NAME_LABEL = /\b(name|nama)\b\s*[:.]?\s*(.*)$/i;
const ADDR_LABEL = /\b(address|alamat)\b\s*[:.]?\s*(.*)$/i;

function cleanLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Mostly-uppercase line of letters/spaces, 2+ words — a plausible printed name. */
function looksLikeName(line: string): boolean {
  if (!/^[A-Z][A-Z\s./'@-]{4,}$/.test(line)) return false;
  const letters = line.replace(/[^A-Za-z]/g, '');
  if (letters.length < 4) return false;
  const upper = line.replace(/[^A-Z]/g, '').length;
  return upper / Math.max(1, letters.length) > 0.8 && line.trim().split(/\s+/).length >= 2;
}

export function extractIdNumber(text: string, jurisdiction: Jurisdiction): string | undefined {
  if (jurisdiction === 'SG') {
    const m = text.match(SG_NRIC);
    return m ? m[1].toUpperCase() : undefined;
  }
  const m = text.match(MY_KAD);
  if (!m) return undefined;
  const digits = m[1].replace(/\D/g, '');
  return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`;
}

export function extractFromOcrText(text: string, jurisdiction: Jurisdiction): OcrExtract {
  const lines = cleanLines(text);
  const out: OcrExtract = {};

  out.nric = extractIdNumber(text, jurisdiction);

  // Name: prefer an explicit "Name:/Nama:" label. Value may be inline or on the next line
  // (both ID cards put the label on its own line). Fall back to a name-shaped line.
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(NAME_LABEL);
    if (!m) continue;
    const inline = m[2].trim();
    if (inline) {
      out.name = inline.replace(/\s+/g, ' ');
      break;
    }
    const next = lines[i + 1]?.trim();
    if (next && !ADDR_LABEL.test(next)) {
      out.name = next.replace(/\s+/g, ' ');
      break;
    }
  }
  if (!out.name) {
    const cand = lines.find(looksLikeName);
    if (cand) out.name = cand.replace(/\s+/g, ' ').trim();
  }

  // Address: collect lines after an "Address:/Alamat:" label (best-effort).
  const addrIdx = lines.findIndex((l) => ADDR_LABEL.test(l));
  if (addrIdx !== -1) {
    const inline = lines[addrIdx].match(ADDR_LABEL)?.[2]?.trim();
    const parts = [inline, ...lines.slice(addrIdx + 1, addrIdx + 4)].filter(Boolean) as string[];
    if (parts.length) out.address = parts.join('\n');
  }

  return out;
}
