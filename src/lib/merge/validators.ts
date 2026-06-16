/* Identity-document validators. SG NRIC/FIN checksum is the canonical published algorithm.
 * Confidence: high for S/T/F/G series; moderate for the newer M series (format-gated, checksum best-effort). */

const ST_TABLE = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
const FG_TABLE = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
const M_TABLE = ['K', 'L', 'J', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X'];
const WEIGHTS = [2, 7, 6, 5, 4, 3, 2];

export const SG_NRIC_RE = /^[STFGM]\d{7}[A-Z]$/;

/** Strict format only: prefix letter + 7 digits + suffix letter. */
export function isSgNricFormat(nric: string): boolean {
  return SG_NRIC_RE.test(String(nric).trim().toUpperCase());
}

/** Full checksum validation. Returns true only if format AND check digit are valid. */
export function isValidSgNric(nric: string): boolean {
  const v = String(nric).trim().toUpperCase();
  if (!SG_NRIC_RE.test(v)) return false;

  const prefix = v[0];
  const digits = v.slice(1, 8);
  const expected = v[8];

  let total = 0;
  for (let i = 0; i < 7; i++) total += Number(digits[i]) * WEIGHTS[i];
  if (prefix === 'T' || prefix === 'G') total += 4;
  if (prefix === 'M') total += 3;

  let check: string;
  if (prefix === 'S' || prefix === 'T') {
    check = ST_TABLE[total % 11];
  } else if (prefix === 'F' || prefix === 'G') {
    check = FG_TABLE[total % 11];
  } else {
    // M series — newer; reversed index. Best-effort.
    check = M_TABLE[10 - (total % 11)];
  }
  return check === expected;
}
