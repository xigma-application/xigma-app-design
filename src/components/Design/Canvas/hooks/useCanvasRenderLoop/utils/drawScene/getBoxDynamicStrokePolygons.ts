// types
import { TPoint } from 'types/canvas';

// others
import { STROKE_DYNAMIC_MAX_CONTROL_POINTS, STROKE_DYNAMIC_MAX_SAMPLES } from 'constant/strokeDynamic';

// utils
import { clamp } from 'utils/math/clamp';
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { getDynamicStrokeNoise } from './getDynamicStrokeNoise';

export type TDynamicStrokeOptions = { frequency: number; seed: string; smoothen: number; strokeWidth: number; wiggle: number };

const MAX_SUBDIVISIONS = 8;
const EDGE_EPSILON = 1e-6;

const lerpPoint = (from: TPoint, to: TPoint, t: number): TPoint => ({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });

const isSamePoint = (first: TPoint, second: TPoint): boolean => first.x === second.x && first.y === second.y;

const dropDuplicates = (points: TPoint[]): TPoint[] =>
  points.filter((point, index) => !isSamePoint(point, points[(index + points.length - 1) % points.length]));

const getSegmentDistances = (start: number, length: number, step: number): number[] => {
  const end = start + length;
  const first = Math.floor(start / step) + 1;
  const inner: number[] = [];

  for (let index = first; index * step < end - EDGE_EPSILON; index += 1) {
    if (index * step > start + EDGE_EPSILON) {
      inner.push(index * step);
    }
  }

  return [start, ...inner, end];
};

export const getBoxDynamicStrokePolygons = (
  outer: TPoint[],
  inner: TPoint[],
  { frequency, seed, smoothen, strokeWidth, wiggle }: TDynamicStrokeOptions,
): TPoint[][] | null => {
  const count = outer.length;
  const mids = outer.map((point, index) => lerpPoint(point, inner[index], 0.5));
  const lengths = mids.map((point, index) => Math.hypot(mids[(index + 1) % count].x - point.x, mids[(index + 1) % count].y - point.y));
  const perimeter = lengths.reduce((total, length) => total + length, 0);

  if (perimeter > 0 && strokeWidth > 0 && frequency > 0) {
    const targetWavelength = (2 * strokeWidth) / (frequency / 100);
    const controlPoints = clamp(Math.round(perimeter / targetWavelength), 2, STROKE_DYNAMIC_MAX_CONTROL_POINTS);
    const wavelength = perimeter / controlPoints;
    const random = createSeededRandom(seed);
    const values = Array.from({ length: controlPoints }, () => random() * 2 - 1);
    const subdivisions = smoothen > 0 ? clamp(Math.floor(STROKE_DYNAMIC_MAX_SAMPLES / controlPoints), 1, MAX_SUBDIVISIONS) : 1;
    const step = wavelength / subdivisions;
    const amplitude = (wiggle / 100) * strokeWidth;
    const outerPoints: TPoint[] = [];
    const innerPoints: TPoint[] = [];
    let start = 0;

    lengths.forEach((length, index) => {
      if (length > 0) {
        const next = (index + 1) % count;
        const normal = { x: (mids[next].y - mids[index].y) / length, y: -(mids[next].x - mids[index].x) / length };

        getSegmentDistances(start, length, step).forEach((distance) => {
          const t = (distance - start) / length;
          const offset = amplitude * getDynamicStrokeNoise(values, distance, wavelength, smoothen / 100);
          const outerBase = lerpPoint(outer[index], outer[next], t);
          const innerBase = lerpPoint(inner[index], inner[next], t);

          outerPoints.push({ x: outerBase.x + normal.x * offset, y: outerBase.y + normal.y * offset });
          innerPoints.push({ x: innerBase.x + normal.x * offset, y: innerBase.y + normal.y * offset });
        });
      }

      start += length;
    });

    return [dropDuplicates(outerPoints), dropDuplicates(innerPoints)];
  }

  return null;
};
