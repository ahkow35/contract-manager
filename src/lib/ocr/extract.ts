/* Pure extraction from raw OCR text. ID-number patterns are reliable and unit-tested; name/address
 * are best-effort heuristics (card-layout dependent) — always operator-verified, never authoritative.
 * The OCR panel also shows the raw text so the operator can grab anything the heuristics miss. */

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

// Words that appear on ID-card chrome (labels/headers), not in a person's name.
const HEADER_WORDS =
  /\b(republic|singapore|identity|card|no|nric|fin|malaysia|kad|pengenalan|mykad|warganegara|race|bangsa|sex|jantina|date|birth|tarikh|lahir|country|negara|address|alamat|name|nama|valid|expiry)\b/i;

// Field labels that follow the name on an ID card — used to bound the name region.
const STOP_LABEL =
  /\b(race|bangsa|sex|jantina|date|tarikh|birth|lahir|country|negara|place|nationality|kewarganegaraan|address|alamat|blood)\b/i;

function cleanLines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

/** Permissive: a line that could be (part of) a name — has letters, isn't a number blob. */
function plausibleNameContent(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 60) return false;
  if (/\d{3,}/.test(t)) return false;
  return t.replace(/[^A-Za-z]/g, '').length >= 3;
}

/** A printed personal name: mostly-letters, no digits, not card chrome, plausibly capitalised. */
function looksLikeName(line: string): boolean {
  const t = line.trim();
  if (t.length < 3 || t.length > 60) return false;
  if (/\d/.test(t)) return false;
  if (HEADER_WORDS.test(t)) return false;
  if (!/^[A-Za-z][A-Za-z\s.,'@/-]+$/.test(t)) return false;
  const letters = t.replace(/[^A-Za-z]/g, '');
  if (letters.length < 3) return false;
  const upper = t.replace(/[^A-Z]/g, '').length;
  return upper / letters.length >= 0.6; // IC names are mostly upper-case
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
  const nricLine = out.nric ? lines.findIndex((l) => l.toUpperCase().includes(out.nric!)) : -1;

  // Name — strategy 1 (most reliable for ID cards): the value(s) between the "Name/Nama" label and
  // the next field label (Race, Date of birth, Sex…). Permissive about the name's own formatting.
  const nameLabelIdx = lines.findIndex((l) => NAME_LABEL.test(l) && !STOP_LABEL.test(l));
  if (nameLabelIdx >= 0) {
    const collected: string[] = [];
    const inline = lines[nameLabelIdx].replace(/^.*?\b(?:name|nama)\b\s*[:.]?\s*/i, '').trim();
    if (inline && plausibleNameContent(inline) && !HEADER_WORDS.test(inline)) collected.push(inline);
    for (let i = nameLabelIdx + 1; i < lines.length && collected.length < 3; i++) {
      if (STOP_LABEL.test(lines[i])) break;
      if (plausibleNameContent(lines[i]) && !HEADER_WORDS.test(lines[i])) collected.push(lines[i].trim());
      else if (collected.length) break;
    }
    if (collected.length) out.name = collected.join(' ').replace(/\s+/g, ' ');
  }
  // Strategy 2: first name-shaped line — searching AFTER the NRIC first (names sit near the number).
  if (!out.name) {
    const ordered = nricLine >= 0
      ? [...lines.slice(nricLine + 1), ...lines.slice(0, nricLine + 1)]
      : lines;
    const cand = ordered.find(looksLikeName);
    if (cand) out.name = cand.replace(/\s+/g, ' ').trim();
  }

  // Address: lines following an "Address:/Alamat:" label (best-effort).
  const addrIdx = lines.findIndex((l) => ADDR_LABEL.test(l));
  if (addrIdx !== -1) {
    const inline = lines[addrIdx].match(ADDR_LABEL)?.[2]?.trim();
    const parts = [inline, ...lines.slice(addrIdx + 1, addrIdx + 4)].filter(Boolean) as string[];
    if (parts.length) out.address = parts.join('\n');
  }

  return out;
}
