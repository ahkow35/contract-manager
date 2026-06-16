/* Curated template library. Each entry is a TemplateDef tying a blank tokenised .docx
 * to its form, validation, token map, and filename. Add HR letters + more contracts here. */

import type { TemplateDef } from './types';
import { sgLocalSecondment } from './templates/sg-local-secondment';
import { lcPartTimer } from './templates/lc-part-timer';

export const TEMPLATES: TemplateDef[] = [
  sgLocalSecondment,
  lcPartTimer, // MY — retained; blocked until official .docx is tokenised + dropped in
];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
