/* In-browser .docx merge via docxtemplater. PII enters here and leaves only as a downloaded Blob.
 * INV-1/INV-5: nothing in this module touches the network or persists anything. */

import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import type { TokenMap } from './types';

/**
 * Merge a tokenised blank .docx (ArrayBuffer) with values, fully in-browser.
 * `linebreaks: true` turns "\n" in values (e.g. multi-line address) into Word line breaks.
 */
export function renderDocx(template: ArrayBuffer, data: TokenMap): Blob {
  const zip = new PizZip(template);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{', end: '}' },
  });
  doc.render(data);
  return doc.getZip().generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }) as Blob;
}

/** Trigger a client-side download of a Blob. Client-only (uses DOM). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
