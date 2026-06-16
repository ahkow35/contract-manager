/* Generic, template-agnostic merge formatting — pure, deterministic, no timezone drift.
 * Ported from CoWork/Employment Contract/contract-merge.js (26/26 tests). Reused by every template. */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** 1 -> "st", 2 -> "nd", 3 -> "rd", 4..20 -> "th", 21 -> "st" ... */
export function ordinal(n: number): string {
  const r10 = n % 10;
  const r100 = n % 100;
  if (r100 >= 11 && r100 <= 13) return 'th';
  if (r10 === 1) return 'st';
  if (r10 === 2) return 'nd';
  if (r10 === 3) return 'rd';
  return 'th';
}

export interface YMD {
  y: number;
  mo: number;
  d: number;
}

/** Accepts a "YYYY-MM-DD" string (from <input type=date>) -> {y,mo,d} with no TZ drift. */
export function parseISO(s: string): YMD | null {
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { y: +m[1], mo: +m[2], d: +m[3] };
}

/** "2026-05-05" -> "5th May 2026" (body/letter style, WITH ordinal). */
export function longOrdinal(iso: string): string | null {
  const p = parseISO(iso);
  if (!p) return null;
  return `${p.d}${ordinal(p.d)} ${MONTHS[p.mo - 1]} ${p.y}`;
}

/** "2026-05-05" -> "5 May 2026" (filename style, NO ordinal). */
export function longPlain(iso: string): string | null {
  const p = parseISO(iso);
  if (!p) return null;
  return `${p.d} ${MONTHS[p.mo - 1]} ${p.y}`;
}

/** start+end -> "5th May 2026 – 31st May 2026" (en dash, as in the template). */
export function durationStr(startISO: string, endISO: string): string | null {
  const a = longOrdinal(startISO);
  const b = longOrdinal(endISO);
  return a && b ? `${a} – ${b}` : null;
}

/** "Sarah Binti Johan Shah" -> "Sarah". First whitespace-delimited token, trimmed. */
export function firstName(fullName: string): string {
  return String(fullName || '').trim().split(/\s+/)[0] || '';
}
