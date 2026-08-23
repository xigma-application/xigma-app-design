import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

// tolerant screenshot comparison for cases where two renders of the *same* geometry are expected to
// differ only by sub-pixel antialiasing noise (e.g. comparing a curve rendered as one flattened
// polyline against the same curve split into two independently-flattened polylines — each side's own
// adaptive segment count, see getVectorCurveSegmentCount.ts, means the two renders sample the curve at
// slightly different points along its length, even though the underlying path is identical). A plain
// Buffer.equals() check is the wrong tool here; pixelmatch's default antialiasing detection (includeAA:
// false) is built for exactly this comparison.
export const countMismatchedPixels = (a: Buffer, b: Buffer): number => {
  const pngA = PNG.sync.read(a);
  const pngB = PNG.sync.read(b);

  if (pngA.width !== pngB.width || pngA.height !== pngB.height) {
    throw new Error(`Screenshot dimensions differ: ${pngA.width}x${pngA.height} vs ${pngB.width}x${pngB.height}`);
  }

  return pixelmatch(pngA.data, pngB.data, null, pngA.width, pngA.height);
};
