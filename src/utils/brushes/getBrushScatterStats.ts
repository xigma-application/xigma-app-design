// types
import { TBrushContourPoint, TBrushScatterStats, TBrushStrip } from './types';

const OPAQUE = 0.5;

const getLoopArea = (points: TBrushContourPoint[]): number =>
  Math.abs(
    points.reduce(
      (total, point, index) => total + (point.u * points[(index + 1) % points.length].v - points[(index + 1) % points.length].u * point.v),
      0,
    ),
  ) / 2;

export const getBrushScatterStats = (strip: TBrushStrip, contours: TBrushContourPoint[][]): TBrushScatterStats => {
  let opaque = 0;
  let cells = 0;
  let sumV = 0;
  let sumV2 = 0;

  for (let row = 0; row < strip.height; row += 1) {
    const v = (row - strip.halfWidth) / strip.scale;

    if (Math.abs(v) <= 1) {
      for (let column = 0; column < strip.length; column += 1) {
        cells += 1;

        if (strip.data[row * strip.length + column] > OPAQUE) {
          opaque += 1;
          sumV += v;
          sumV2 += v * v;
        }
      }
    }
  }

  const mean = opaque > 0 ? sumV / opaque : 0;
  const crossSigma = opaque > 0 ? Math.sqrt(Math.max(0, sumV2 / opaque - mean * mean)) / 2 : 0.2;
  const areas = contours.map(getLoopArea).sort((first, second) => first - second);
  const medianArea = (areas[Math.floor(areas.length / 2)] ?? 0) * (strip.length - 1) * strip.scale;
  const dotRadiusPx = Math.sqrt(medianArea / Math.PI);

  return {
    coverage: cells > 0 ? opaque / cells : 0,
    crossSigma: Math.min(0.4, Math.max(0.08, crossSigma)),
    dotRadiusRatio: Math.min(0.06, Math.max(0.008, dotRadiusPx / (2 * strip.scale))),
  };
};
