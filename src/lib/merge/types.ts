/* Template contract: the single definition that ties a blank .docx to its form, validation,
 * token map, and output filename. One TemplateDef per curated document in the library. */

export type Jurisdiction = 'SG' | 'MY';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'nric'
  | 'currency'
  | 'number'
  | 'select'
  | 'checkbox';

/** Which OCR-extracted value (if any) pre-fills this field. Assist only — operator verifies. */
export type OcrSource = 'name' | 'nric' | 'address';

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  default?: string;
  help?: string;
  ocrSource?: OcrSource;
  /** options for type: 'select' */
  options?: string[];
  /** Show this field only when the named 'checkbox' field is ticked (e.g. a toggled clause). */
  showIf?: string;
}

/** Raw form values keyed by FieldDef.id. Checkboxes store '1' (on) or '' (off). */
export type FormValues = Record<string, string>;

/** The {token} -> value map docxtemplater substitutes into the .docx.
 *  Booleans drive conditional sections ({#flag}…{/flag}); strings fill {token}s. */
export type TokenMap = Record<string, string | boolean>;

export interface TemplateDef {
  id: string;
  title: string;
  jurisdiction: Jurisdiction;
  /** Storage key/name of the tokenised blank .docx (Supabase Storage; contains NO PII). */
  templateFile: string;
  /** Does this template expose the ID-card OCR pre-fill step? */
  ocr: boolean;
  fields: FieldDef[];
  /** Returns an array of human-readable errors; empty = ok. */
  validate: (form: FormValues) => string[];
  /** Maps validated form values to the docxtemplater token map. */
  tokens: (form: FormValues) => TokenMap;
  /** Output download filename, e.g. "LC Part Timer - {Name} (...).docx". */
  fileName: (form: FormValues) => string;
}
