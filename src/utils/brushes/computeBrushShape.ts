// types
import { TBrushAlpha, TBrushShape } from './types';

// utils
import { extractBrushStrip } from './extractBrushStrip/extractBrushStrip';
import { getBrushScatterStats } from './getBrushScatterStats';
import { traceBrushContours } from './traceBrushContours/traceBrushContours';

export const computeBrushShape = (alpha: TBrushAlpha): TBrushShape | null => {
  const strip = extractBrushStrip(alpha);

  if (strip) {
    const contours = traceBrushContours(strip);
    return { contours, scatter: getBrushScatterStats(strip, contours) };
  }

  return null;
};
