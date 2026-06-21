/* Client-only OCR. Tesseract worker + core wasm + language data are all loaded SAME-ORIGIN from
 * /ocr (no CDN) so the card image never leaves the browser and there are zero off-origin requests. */

import { createWorker } from 'tesseract.js';

export async function recognizeImage(
  image: File | Blob,
  onProgress?: (fraction: number) => void,
  /** Tesseract page-segmentation mode. '4' (single column) suits the binarised MyKad; default auto. */
  psm?: string,
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
    if (psm) await worker.setParameters({ tessedit_pageseg_mode: psm as never });
    const { data } = await worker.recognize(image);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
