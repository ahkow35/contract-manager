/* Client-only image preprocessing for ID-card OCR. The MyKad's busy light-blue holographic
 * background (guilloché, ghost portrait, watermarks) drowns Tesseract in noise. The dark navy text
 * separates in the BLUE channel, so we:
 *   1. crop to the card (the dark-content bounding box) — drops the white scan margins so the text
 *      isn't shrunk by the surrounding page,
 *   2. upscale to a working width so small print is legible,
 *   3. binarise with Sauvola ADAPTIVE thresholding (per-pixel local threshold via integral images),
 *      which copes with the card's large photo and uneven lighting where a global threshold fails.
 * Everything runs on a <canvas>; nothing leaves the browser. */

const SOURCE_MAX = 2400; // cap the decoded image before processing (bounds memory/time)
const TARGET_W = 2200; // working width of the cropped card
const SAUVOLA_K = 0.34;

export async function binarizeIdCard(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);

  // --- decode (capped) into a source canvas ---
  const ds = Math.min(1, SOURCE_MAX / Math.max(bitmap.width, bitmap.height));
  const sw = Math.max(1, Math.round(bitmap.width * ds));
  const sh = Math.max(1, Math.round(bitmap.height * ds));
  const src = document.createElement('canvas');
  src.width = sw;
  src.height = sh;
  const sctx = src.getContext('2d', { willReadFrequently: true });
  if (!sctx) throw new Error('Canvas not available for OCR preprocessing.');
  sctx.drawImage(bitmap, 0, 0, sw, sh);
  bitmap.close?.();
  const sdata = sctx.getImageData(0, 0, sw, sh).data;

  // --- crop to the dark-content bounding box (the card, minus white page margins) ---
  let minX = sw;
  let minY = sh;
  let maxX = 0;
  let maxY = 0;
  let found = false;
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (sdata[(y * sw + x) * 4 + 2] < 150) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 8;
  let cx = 0;
  let cy = 0;
  let cw = sw;
  let ch = sh;
  if (found && (maxX - minX) > sw * 0.2 && (maxY - minY) > sh * 0.15) {
    cx = Math.max(0, minX - pad);
    cy = Math.max(0, minY - pad);
    cw = Math.min(sw, maxX + pad) - cx;
    ch = Math.min(sh, maxY + pad) - cy;
  }

  // --- upscale the crop to the working width ---
  const scale = Math.min(3, Math.max(1, TARGET_W / cw));
  const W = Math.max(1, Math.round(cw * scale));
  const H = Math.max(1, Math.round(ch * scale));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas not available for OCR preprocessing.');
  ctx.drawImage(src, cx, cy, cw, ch, 0, 0, W, H);

  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const n = W * H;
  const blue = new Float64Array(n);
  for (let i = 0; i < n; i++) blue[i] = d[i * 4 + 2];

  // --- Sauvola: integral images of blue and blue² for O(1) local mean/variance ---
  const iw = W + 1;
  const sum = new Float64Array(iw * (H + 1));
  const sum2 = new Float64Array(iw * (H + 1));
  for (let y = 0; y < H; y++) {
    let rs = 0;
    let rs2 = 0;
    for (let x = 0; x < W; x++) {
      const v = blue[y * W + x];
      rs += v;
      rs2 += v * v;
      const here = (y + 1) * iw + (x + 1);
      sum[here] = sum[y * iw + (x + 1)] + rs;
      sum2[here] = sum2[y * iw + (x + 1)] + rs2;
    }
  }
  const r = clamp(Math.round(W / 60), 16, 60);
  for (let y = 0; y < H; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(H, y + r + 1);
    for (let x = 0; x < W; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(W, x + r + 1);
      const area = (y1 - y0) * (x1 - x0);
      const s = sum[y1 * iw + x1] - sum[y0 * iw + x1] - sum[y1 * iw + x0] + sum[y0 * iw + x0];
      const s2 = sum2[y1 * iw + x1] - sum2[y0 * iw + x1] - sum2[y1 * iw + x0] + sum2[y0 * iw + x0];
      const mean = s / area;
      const std = Math.sqrt(Math.max(0, s2 / area - mean * mean));
      const t = mean * (1 + SAUVOLA_K * (std / 128 - 1));
      const c = blue[y * W + x] > t ? 255 : 0;
      const px = (y * W + x) * 4;
      d[px] = d[px + 1] = d[px + 2] = c;
      d[px + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('OCR preprocessing failed.'))), 'image/png');
  });
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
