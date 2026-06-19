/* SG INWW "Employment Contract - INworldwide (Internal Employee)" — for INWW's own staff
 * (not an outsourced secondment). Tokenised from the official .docx; bracketed fill-ins
 * ([DATE], [S$3,200.00], [S$50.00]) and the sample designation replaced with {tokens}.
 * Open-ended employment: no contract end date (termination by notice). */

import { amountToWords } from '../amount-to-words';
import { longOrdinal, parseISO } from '../format';
import { isSgNricFormat, isValidSgNric } from '../validators';
import type { FormValues, TemplateDef, TokenMap } from '../types';

function fmtFigure(input: string): string {
  const n = Math.floor(Number(String(input).replace(/[^0-9.]/g, '')));
  return Number.isFinite(n) && n > 0 ? n.toLocaleString('en-SG') : '';
}

function validate(f: FormValues): string[] {
  const errs: string[] = [];
  if (!f.name?.trim()) errs.push('Employee name is required.');
  if (!f.address?.trim()) errs.push('Home address is required.');
  if (!f.designation?.trim()) errs.push('Designation is required.');
  if (!(parseFloat(String(f.salaryFigure).replace(/[^0-9.]/g, '')) > 0))
    errs.push('Monthly basic salary must be a positive number.');
  if (!(parseFloat(String(f.mobileFigure).replace(/[^0-9.]/g, '')) >= 0))
    errs.push('Mobile phone allowance must be a number (0 if none).');
  if (!parseISO(f.startDate)) errs.push('Employment start date is required.');
  if (f.nric?.trim()) {
    if (!isSgNricFormat(f.nric)) errs.push('NRIC/FIN format looks wrong (expected e.g. S1234567D).');
    else if (!isValidSgNric(f.nric)) errs.push('NRIC check digit looks wrong — please re-check.');
  }
  return errs;
}

function tokens(f: FormValues): TokenMap {
  return {
    letterDate: longOrdinal(f.letterDate) ?? '',
    name: f.name.trim(),
    salutation: f.name.trim(), // header "Dear XXXXXXXX," — full name
    address: f.address.trim(),
    designation: f.designation.trim(),
    salaryFigure: fmtFigure(f.salaryFigure),
    mobileFigure: fmtFigure(f.mobileFigure),
    startDate: longOrdinal(f.startDate) ?? '',
  };
}

function fileName(f: FormValues): string {
  return `Employment Contract - INworldwide - ${f.name.trim()}.docx`;
}

export const sgInternalEmployee: TemplateDef = {
  id: 'sg-internal-employee',
  title: 'SG — INworldwide Internal Employee Employment Contract',
  jurisdiction: 'SG',
  templateFile: 'sg-internal-employee.tokenised.docx',
  ocr: true,
  fields: [
    { id: 'letterDate', label: 'Letter date', type: 'date', required: true },
    { id: 'name', label: 'Employee full name', type: 'text', required: true, ocrSource: 'name' },
    { id: 'address', label: 'Home address', type: 'textarea', required: true, ocrSource: 'address' },
    { id: 'designation', label: 'Designation', type: 'text', required: true,
      default: 'Talent Acquisition Executive' },
    { id: 'salaryFigure', label: 'Monthly basic salary (S$)', type: 'currency', required: true },
    { id: 'mobileFigure', label: 'Mobile phone allowance (S$/month)', type: 'currency', required: true,
      default: '50', help: 'Enter 0 if no phone allowance applies.' },
    { id: 'startDate', label: 'Employment start date', type: 'date', required: true,
      help: '"with effect from" date in the opening paragraph.' },
    { id: 'nric', label: 'NRIC / FIN (optional)', type: 'nric', ocrSource: 'nric',
      help: 'Not printed in the contract body; for your record / OCR check only.' },
  ],
  validate,
  tokens,
  fileName,
};
