/* Client-only OCR. Tesseract worker + core wasm + language data are all loaded SAME-ORIGIN from
 * /ocr (no CDN) so the card image never leaves the browser and there are zero off-origin requests. */

import { createWorker } from 'tesseract.js';

export async function recognizeImage(
  image: File | Blob,
  onProgress?: (fraction: number) => void,
  /** Page-segmentation modes to run and merge. The MyKad uses ['4','6'] — PSM 4 (single column)
   *  and PSM 6 (uniform block) read complementary lines of the card. Default: one auto pass. */
  psms?: string[],
): Promise<string> {
  const worker = await createWorker('eng', 1, {
    workerPath: '/ocr/worker.min.js',
    corePath: '/ocr',
    langPath: '/ocr/lang',
    gzip: true,
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') onProgress?.(m.progress);
    },
  });
  try {
    if (!psms || psms.length === 0) {
      const { data } = await worker.recognize(image);
      return data.text;
    }
    const out: string[] = [];
    for (const psm of psms) {
      await worker.setParameters({ tessedit_pageseg_mode: psm as never });
      const { data } = await worker.recognize(image);
      out.push(data.text);
    }
    return out.join('\n');
  } finally {
    await worker.terminate();
  }
}
