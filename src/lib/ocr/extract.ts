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
  /\b(republic|singapore|identity|card|cardno|nric|fin|malaysia|kad|pengenalan|mykad|warganegara|lelaki|perempuan|islam|race|bangsa|sex|jantina|date|tarikh|birth|lahir|country|negara|place|nationality|kewarganegaraan|address|alamat|valid|expiry|blood)\b/i;
// Global variant for stripping chrome words out of OCR'd address lines (warganegara/perempuan…).
const CHROME_WORDS_G =
  /\b(warganegara|lelaki|perempuan|islam|mykad|kad|pengenalan|malaysia|identity|card)\b/gi;

// MyKad has no "Address:" label — the address is bare lines spread across the card. We classify
// each line into one of the four address rows and emit them in canonical order, so the result is
// clean regardless of OCR line order (we run two page-segmentation passes that read different rows).
const MY_STREET = /\b(no\.?\s*\d|jalan|jln|lorong|lrg|persiaran|lebuh)\b/i;
const MY_LOCALITY = /\b(taman|kampung|kg\.?|bandar|desa|seksyen|blok|apartment|residensi)\b/i;
const MY_POSTCODE = /\b\d{5}\b/;
const MY_STATE =
  /\b(johor|kedah|kelantan|melaka|malacca|negeri sembilan|pahang|perak|perlis|pulau pinang|penang|sabah|sarawak|selangor|terengganu|kuala lumpur|labuan|putrajaya|persekutuan)\b/i;

/** Assemble a MyKad address from OCR lines: pick the best line per row, output street→locality→
 *  postcode→state. Strips card-chrome words and OCR noise (lower-case junk tokens). */
function myKadAddress(lines: string[]): string | undefined {
  const cats: Array<['street' | 'locality' | 'post' | 'state', RegExp]> = [
    ['street', MY_STREET], ['locality', MY_LOCALITY], ['post', MY_POSTCODE], ['state', MY_STATE],
  ];
  const tidy = (cat: string, l: string): string => {
    if (cat === 'state') return (l.match(MY_STATE)?.[0] ?? l).toUpperCase();
    if (cat === 'post') {
      const m = l.match(/\b(\d{5})\s+([A-Za-z]{2,})/);
      return m ? `${m[1]} ${m[2].toUpperCase()}` : l;
    }
    // street/locality: drop lower-case OCR noise (MyKad text is upper-case) and 1-char junk.
    return l.split(/\s+/).filter((t) => t.length > 1 && /[A-Z0-9]/.test(t)).join(' ');
  };
  const picked: Record<string, string> = {};
  for (const raw of lines) {
    const l = raw.replace(CHROME_WORDS_G, ' ').replace(/[^\w\s,./-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (l.replace(/[^A-Za-z]/g, '').length < 3) continue;
    for (const [cat, rx] of cats) {
      if (!rx.test(l)) continue;
      const t = tidy(cat, l);
      if (t && (!picked[cat] || t.length > picked[cat].length)) picked[cat] = t;
    }
  }
  const out = (['street', 'locality', 'post', 'state'] as const).map((c) => picked[c]).filter(Boolean);
  return out.length ? out.join('\n') : undefined;
}

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

/** Strip OCR noise (digits, symbols, brackets) → just the letters/spaces of a potential name. */
function nameCore(line: string): string {
  return line.replace(/[^A-Za-z\s.'/-]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Score a line by how much it looks like a printed personal name (0 = not a name). */
function nameScore(line: string): number {
  const core = nameCore(line);
  if (core.length < 3 || core.length > 60) return 0;
  if (HEADER_WORDS.test(core)) return 0;
  const letters = core.replace(/[^A-Za-z]/g, '').length;
  if (letters < 3) return 0;
  // Reject noisy lines (lots of symbols/digits relative to letters) — that's card chrome, not a name.
  const nonSpace = line.replace(/\s/g, '').length;
  const nonLetter = line.replace(/[A-Za-z\s]/g, '').length;
  if (nonSpace > 0 && nonLetter / nonSpace > 0.35) return 0;
  const words = core.split(/\s+/).filter((w) => /^[A-Za-z]{2,}$/.test(w));
  if (words.length < 2 || words.length > 5) return 0;
  const upper = core.replace(/[^A-Z]/g, '').length;
  if (upper / letters < 0.5) return 0; // IC names are mostly upper-case
  return words.length * 10 + Math.round((upper / letters) * 10);
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

  // Name — strategy 1 (best when labels read cleanly): text between the "Name" label and the next
  // field label (Race, Date of birth, Sex…). Permissive about the name's own formatting.
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
    if (collected.length) out.name = nameCore(collected.join(' '));
  }

  // Strategy 2 (no readable label): score every line, pick the best name candidate. Tolerates OCR
  // noise appended to the name line (e.g. "NYAN YUEN KEONG 7}") and rejects garbled chrome lines.
  if (!out.name) {
    // On a MyKad the name sits directly below the ID number — searching only the lines after it
    // avoids the garbled "KAD PENGENALAN / IDENTITY CARD" title block scoring as a name.
    let scope = lines;
    if (jurisdiction === 'MY') {
      // Permissive id-line match (tolerates a dropped leading digit) — independent of whether the
      // strict NRIC extraction above succeeded.
      const idIdx = lines.findIndex((l) => /\d{5,6}[-\s]?\d{2}[-\s]?\d{4}/.test(l));
      if (idIdx >= 0) scope = lines.slice(idIdx + 1);
    }
    let best = '';
    let bestScore = 0;
    for (const line of scope) {
      const s = nameScore(line);
      if (s > bestScore) {
        bestScore = s;
        best = nameCore(line);
      }
    }
    if (best) out.name = best;
  }

  // Address: lines following an "Address:/Alamat:" label (best-effort).
  const addrIdx = lines.findIndex((l) => ADDR_LABEL.test(l));
  if (addrIdx !== -1) {
    const inline = lines[addrIdx].match(ADDR_LABEL)?.[2]?.trim();
    const parts = [inline, ...lines.slice(addrIdx + 1, addrIdx + 4)].filter(Boolean) as string[];
    if (parts.length) out.address = parts.join('\n');
  }

  // MyKad has no address label — assemble it from the bare address rows.
  if (!out.address && jurisdiction === 'MY') out.address = myKadAddress(lines);

  return out;
}
