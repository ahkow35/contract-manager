import { describe, expect, it } from 'vitest';
import { amountToWords } from './amount-to-words';

describe('amountToWords (INWW house style)', () => {
  it('4100 -> Four Thousand and One Hundred (matches template sample)', () =>
    expect(amountToWords(4100)).toBe('Four Thousand and One Hundred'));
  it('parses "S$4,100"', () => expect(amountToWords('S$4,100')).toBe('Four Thousand and One Hundred'));
  it('parses "4,100"', () => expect(amountToWords('4,100')).toBe('Four Thousand and One Hundred'));
  it('3500 -> Three Thousand and Five Hundred', () =>
    expect(amountToWords(3500)).toBe('Three Thousand and Five Hundred'));
  it('handles tens+units', () => expect(amountToWords(4250)).toBe('Four Thousand and Two Hundred and Fifty'));
  it('handles plain hundreds', () => expect(amountToWords(800)).toBe('Eight Hundred'));
  it('empty for zero/garbage', () => {
    expect(amountToWords(0)).toBe('');
    expect(amountToWords('abc')).toBe('');
  });
});
