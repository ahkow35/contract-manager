/* Client-only image preprocessing for ID-card OCR. The MyKad has a busy light-blue holographic
 * security background (guilloché swirls, ghost portrait, watermarks) that drowns Tesseract in
 * noise — raw OCR returns near-garbage. The dark navy text separates cleanly in the BLUE channel
 * (text is dark there; the blue pattern is bright). A single global threshold is unreliable across
 * the card's large photo and uneven lighting, so we use Sauvola ADAPTIVE thresholding (per-pixel,
 * from the local mean/variance via integral images). Everything runs on a <canvas>; nothing leaves
 * the browser. */

const MAX_DIM = 2200; // cap working resolution: enough for a card, bounds memory/time
const SAUVOLA_K = 0.34;

/** Blue-channel Sauvola adaptive binarisation. Returns a black-on-white PNG Blob. */
export async function binarizeIdCard(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const W = Math.max(1, Math.round(bitmap.width * scale));
  const H = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas not available for OCR preprocessing.');
  ctx.drawImage(bitmap, 0, 0, W, H);
  bitmap.close?.();

  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const n = W * H;

  // Blue channel as a flat array.
  const blue = new Float64Array(n);
  for (let i = 0; i < n; i++) blue[i] = d[i * 4 + 2];

  // Integral images of blue and blue² (rows W+1, cols... stored row-major (W+1)*(H+1)).
  const iw = W + 1;
  const sum = new Float64Array(iw * (H + 1));
  const sum2 = new Float64Array(iw * (H + 1));
  for (let y = 0; y < H; y++) {
    let rowSum = 0;
    let rowSum2 = 0;
    for (let x = 0; x < W; x++) {
      const v = blue[y * W + x];
      rowSum += v;
      rowSum2 += v * v;
      const here = (y + 1) * iw + (x + 1);
      sum[here] = sum[y * iw + (x + 1)] + rowSum;
      sum2[here] = sum2[y * iw + (x + 1)] + rowSum2;
    }
  }

  const r = clamp(Math.round(W / 95), 12, 40); // window radius ∝ resolution
  const out = img.data;
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
      out[px] = out[px + 1] = out[px + 2] = c;
      out[px + 3] = 255;
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
