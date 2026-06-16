import { describe, expect, it } from 'vitest';
import { durationStr, firstName, longOrdinal, longPlain, ordinal } from './format';

// Ported from CoWork/Employment Contract/contract-merge.test.js
describe('ordinal', () => {
  it.each([
    [1, 'st'], [2, 'nd'], [3, 'rd'], [4, 'th'],
    [11, 'th'], [12, 'th'], [13, 'th'],
    [21, 'st'], [22, 'nd'], [23, 'rd'], [31, 'st'],
  ])('ordinal(%i) = %s', (n, want) => {
    expect(ordinal(n)).toBe(want);
  });
});

describe('date formatting (Sarah real contract)', () => {
  it('longOrdinal start', () => expect(longOrdinal('2026-05-05')).toBe('5th May 2026'));
  it('longOrdinal end', () => expect(longOrdinal('2026-05-31')).toBe('31st May 2026'));
  it('durationStr', () =>
    expect(durationStr('2026-05-05', '2026-05-31')).toBe('5th May 2026 – 31st May 2026'));
  it('letterDate', () => expect(longOrdinal('2026-04-28')).toBe('28th April 2026'));
  it('no TZ drift on month boundary', () =>
    expect(longPlain('2025-09-01')).toBe('1 September 2025'));
});

describe('firstName', () => {
  it('Sarah Binti Johan Shah -> Sarah', () =>
    expect(firstName('Sarah Binti Johan Shah')).toBe('Sarah'));
  it('trims surrounding space', () => expect(firstName('  Chen Mei Jun ')).toBe('Chen'));
});
