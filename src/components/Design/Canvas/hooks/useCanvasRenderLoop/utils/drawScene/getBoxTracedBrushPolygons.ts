// types
import { StrokeBrushDirection, StrokeProfile } from 'types/design/enums';
import { TBrushContourPoint } from 'utils/brushes/types';
import { TPoint } from 'types/canvas';

// utils
import { buildStrokeRing } from './buildStrokeRing';
import { clamp } from 'utils/math/clamp';
import { getStrokeProfileWidthMultiplier } from 'utils/design/stroke/getStrokeProfileWidthMultiplier';
import { sampleStrokeRing } from './sampleStrokeRing';

export type TTracedBrushOptions = { direction: StrokeBrushDirection; flipped: boolean; profile: StrokeProfile; strokeWidth: number };

const MIN_STEP = 1 / 20000;
const MAX_STEP = 0.05;

const densify = (loop: TBrushContourPoint[], step: number): TBrushContourPoint[] =>
  loop.flatMap((point, index) => {
    const next = loop[(index + 1) % loop.length];
    const pieces = Math.max(1, Math.ceil(Math.abs(next.u - point.u) / step));

    return Array.from({ length: pieces }, (_, piece) => ({
      u: point.u + ((next.u - point.u) * piece) / pieces,
      v: point.v + ((next.v - point.v) * piece) / pieces,
    }));
  });

export const getBoxTracedBrushPolygons = (
  outer: TPoint[],
  inner: TPoint[],
  { direction, flipped, profile, strokeWidth }: TTracedBrushOptions,
  contours: TBrushContourPoint[][],
): TPoint[][] | null => {
  const ring = buildStrokeRing(outer, inner);

  if (ring.perimeter > 0 && strokeWidth > 0) {
    const step = clamp((strokeWidth * 0.25) / ring.perimeter, MIN_STEP, MAX_STEP);
    const isRight = direction === StrokeBrushDirection.right;

    return contours.map((loop) =>
      densify(loop, step).map((contourPoint) => {
        const u = clamp(contourPoint.u, 0, 1);
        const travel = u * ring.perimeter;
        const sample = sampleStrokeRing(ring, Math.min(isRight ? travel : ring.perimeter - travel, ring.perimeter - 1e-6));
        const offset = (isRight ? -1 : 1) * contourPoint.v * getStrokeProfileWidthMultiplier(profile, u, flipped);

        return { x: sample.mid.x + sample.vec.x * offset, y: sample.mid.y + sample.vec.y * offset };
      }),
    );
  }

  return null;
};
