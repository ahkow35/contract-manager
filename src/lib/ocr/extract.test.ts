import { describe, expect, it } from 'vitest';
import { extractFromOcrText, extractIdNumber } from './extract';

const SG_CARD = `REPUBLIC OF SINGAPORE
IDENTITY CARD No. S1234567D
Name
TAN LI HUA JANE
Race CHINESE
Date of birth 01-01-1990`;

const MY_CARD = `KAD PENGENALAN MALAYSIA
900101-14-5678
NAMA
SARAH BINTI JOHAN SHAH
Alamat
NO 10 JALAN SAUJANA 2
68000 SELANGOR`;

describe('extractIdNumber', () => {
  it('SG NRIC', () => expect(extractIdNumber(SG_CARD, 'SG')).toBe('S1234567D'));
  it('SG NRIC uppercased', () => expect(extractIdNumber('id s7654321j here', 'SG')).toBe('S7654321J'));
  it('MY MyKad normalised to dashes', () => expect(extractIdNumber(MY_CARD, 'MY')).toBe('900101-14-5678'));
  it('MY MyKad from spaced OCR', () => expect(extractIdNumber('900101 14 5678', 'MY')).toBe('900101-14-5678'));
  it('no match -> undefined', () => expect(extractIdNumber('no id here', 'SG')).toBeUndefined());
});

describe('extractFromOcrText', () => {
  it('SG: nric + name', () => {
    const r = extractFromOcrText(SG_CARD, 'SG');
    expect(r.nric).toBe('S1234567D');
    expect(r.name).toBe('TAN LI HUA JANE');
  });
  it('MY: nric + name + address', () => {
    const r = extractFromOcrText(MY_CARD, 'MY');
    expect(r.nric).toBe('900101-14-5678');
    expect(r.name).toBe('SARAH BINTI JOHAN SHAH');
    expect(r.address).toContain('JALAN SAUJANA 2');
  });
});
