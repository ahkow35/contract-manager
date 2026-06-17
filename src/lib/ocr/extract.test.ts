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

describe('SG NRIC realistic layouts', () => {
  it('name on its own line between Name and Race labels', () => {
    const r = extractFromOcrText(
      'REPUBLIC OF SINGAPORE\nIDENTITY CARD No.\nS1234567D\nName\nTAN AH KOW\nRace\nCHINESE\nDate of birth\n01-01-1985\nSex\nM',
      'SG',
    );
    expect(r.nric).toBe('S1234567D');
    expect(r.name).toBe('TAN AH KOW');
  });

  it('does not mistake the header for the name', () => {
    const r = extractFromOcrText('REPUBLIC OF SINGAPORE\nS7654321J\nName\nLEE WEI MING\nRace\nCHINESE', 'SG');
    expect(r.name).toBe('LEE WEI MING');
  });

  it('inline "Name: value" with mixed case', () => {
    const r = extractFromOcrText('S1234567D\nName: Tan Ah Kow\nRace: Chinese', 'SG');
    expect(r.name).toBe('Tan Ah Kow');
  });
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
