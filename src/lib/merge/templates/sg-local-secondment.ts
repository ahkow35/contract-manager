/* SG INWW "Local Secondment - Employment Contract (Outsourcing)".
 * Tokenised from the official .docx; sample values (Estée Lauder / Marketing Executive /
 * S$4,100 / 5th Jan 2026–4th Jan 2027) replaced with {tokens}. Oracle: filled "Carmen" doc. */

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
  if (!f.client?.trim()) errs.push('Client (assigned company) is required.');
  if (!f.designation?.trim()) errs.push('Designation is required.');
  if (!(parseFloat(String(f.salaryFigure).replace(/[^0-9.]/g, '')) > 0))
    errs.push('Monthly basic salary must be a positive number.');
  if (!f.salaryWords?.trim()) errs.push('Salary in words is required (auto-filled — please verify).');
  if (!parseISO(f.startDate)) errs.push('Start date is required.');
  if (!parseISO(f.endDate)) errs.push('End date is required.');
  if (parseISO(f.startDate) && parseISO(f.endDate) && f.endDate < f.startDate)
    errs.push('End date must be on or after the start date.');
  if (!(parseFloat(f.annualLeave) > 0)) errs.push('Annual leave days must be a positive number.');
  // NRIC optional in this template (signature block is hand-signed); validate only if provided.
  if (f.nric?.trim()) {
    if (!isSgNricFormat(f.nric)) errs.push('NRIC format looks wrong (expected e.g. S1234567D).');
    else if (!isValidSgNric(f.nric)) errs.push('NRIC check digit looks wrong — please re-check.');
  }
  return errs;
}

function tokens(f: FormValues): TokenMap {
  return {
    letterDate: longOrdinal(f.letterDate) ?? '',
    name: f.name.trim(),
    salutation: f.name.trim(), // header label "Dear XXXXXX," — full name; see open question
    address: f.address.trim(), // newlines -> line breaks at render time
    client: f.client.trim(),
    designation: f.designation.trim(),
    salaryFigure: fmtFigure(f.salaryFigure), // "4,100"
    salaryWords: (f.salaryWords?.trim() || amountToWords(f.salaryFigure)),
    startDate: longOrdinal(f.startDate) ?? '',
    endDate: longOrdinal(f.endDate) ?? '',
    annualLeave: String(parseInt(f.annualLeave, 10) || ''),
  };
}

function fileName(f: FormValues): string {
  return `Local Secondment - Employment Contract - ${f.name.trim()}.docx`;
}

export const sgLocalSecondment: TemplateDef = {
  id: 'sg-local-secondment',
  title: 'SG — Local Secondment Employment Contract (Outsourcing)',
  jurisdiction: 'SG',
  templateFile: 'sg-local-secondment.tokenised.docx',
  ocr: true,
  fields: [
    { id: 'letterDate', label: 'Letter date', type: 'date', required: true },
    { id: 'name', label: 'Employee full name', type: 'text', required: true, ocrSource: 'name' },
    { id: 'address', label: 'Home address', type: 'textarea', required: true, ocrSource: 'address' },
    { id: 'client', label: 'Client (assigned company)', type: 'text', required: true,
      help: 'e.g. Estée Lauder Travel Retailing, Inc' },
    { id: 'designation', label: 'Designation', type: 'text', required: true },
    { id: 'salaryFigure', label: 'Monthly basic salary (S$)', type: 'currency', required: true },
    { id: 'salaryWords', label: 'Salary in words', type: 'text', required: true,
      help: 'Auto-filled from the figure — verify before generating.' },
    { id: 'startDate', label: 'Contract start date', type: 'date', required: true },
    { id: 'endDate', label: 'Contract end date', type: 'date', required: true },
    { id: 'annualLeave', label: 'Annual leave (working days)', type: 'number', required: true, default: '16' },
    { id: 'nric', label: 'NRIC (optional)', type: 'nric', ocrSource: 'nric',
      help: 'Not printed in the contract body; for your record / OCR check only.' },
  ],
  validate,
  tokens,
  fileName,
};
