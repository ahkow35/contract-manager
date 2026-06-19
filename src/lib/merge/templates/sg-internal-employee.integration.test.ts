import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { describe, expect, it } from 'vitest';
import { sgInternalEmployee } from './sg-internal-employee';

function renderText(data: Record<string, string | boolean>): string {
  const buf = readFileSync(
    join(process.cwd(), 'public/templates/sg-internal-employee.tokenised.docx'),
  );
  const doc = new Docxtemplater(new PizZip(buf), {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{', end: '}' },
  });
  doc.render(data);
  const out = doc.getZip().generate({ type: 'nodebuffer' });
  const xml = new PizZip(out).file('word/document.xml')!.asText();
  return (xml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [])
    .map((t) => t.replace(/<[^>]+>/g, ''))
    .join('')
    .replace(/&amp;/g, '&');
}

const form = {
  letterDate: '2026-07-10',
  name: 'Daniel Lim Wei Sheng',
  address: '88 Tampines Ave\n#05-12\nSingapore 521088',
  designation: 'HR Operations Lead',
  salaryFigure: '4,500',
  mobileFigure: '60',
  startDate: '2026-08-15',
  nric: 'S1234567D',
};

describe('SG Internal Employee — end-to-end render', () => {
  const text = renderText(sgInternalEmployee.tokens(form));

  it('no unresolved {tokens} or [BRACKET] placeholders remain', () => {
    expect(text).not.toMatch(/\{[#/]?[a-zA-Z]+\}/);
    expect(text).not.toContain('[      DATE');
    expect(text).not.toContain('[S$');
  });
  it('strips the sample designation + salary', () => {
    expect(text).not.toContain('Talent Acquisition Executive');
    expect(text).not.toContain('3,200');
  });
  it('injects designation, salary, mobile allowance', () => {
    expect(text).toContain('HR Operations Lead');
    expect(text).toContain('S$4,500');
    expect(text).toContain('S$60');
  });
  it('header shows full name + address', () => {
    expect(text).toContain('Daniel Lim Wei Sheng');
    expect(text).toContain('Tampines Ave');
    expect(text).not.toContain('Full Name');
  });
  it('fills both [DATE] brackets (letter date + effect date)', () => {
    expect(text).toContain('10th July 2026'); // letter date
    expect(text).toContain('with effect from 15th August 2026'); // employment start
  });
  it('validate passes; mobile allowance of 0 is allowed', () => {
    expect(sgInternalEmployee.validate(form)).toHaveLength(0);
    expect(sgInternalEmployee.validate({ ...form, mobileFigure: '0' })).toHaveLength(0);
  });
});
