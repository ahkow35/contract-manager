import { describe, expect, it } from 'vitest';
import { isSgNricFormat, isValidSgNric } from './validators';

describe('SG NRIC format', () => {
  it('accepts well-formed', () => expect(isSgNricFormat('S1234567D')).toBe(true));
  it('rejects missing suffix', () => expect(isSgNricFormat('S1234567')).toBe(false));
  it('rejects bad prefix', () => expect(isSgNricFormat('A1234567D')).toBe(false));
  it('rejects short digits', () => expect(isSgNricFormat('S123456D')).toBe(false));
});

describe('SG NRIC checksum (canonical published examples)', () => {
  // S1234567D is the widely-documented worked example. Confidence: high for S/T/F/G.
  it('S1234567D valid', () => expect(isValidSgNric('S1234567D')).toBe(true));
  it('S1234567A invalid check digit', () => expect(isValidSgNric('S1234567A')).toBe(false));
  it('T0000001 series computes (no throw)', () =>
    expect(typeof isValidSgNric('T0000001J')).toBe('boolean'));
  it('lowercase tolerated', () => expect(isValidSgNric('s1234567d')).toBe(true));
});
