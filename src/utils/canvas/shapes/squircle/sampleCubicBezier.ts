// types
import { TPoint } from 'types/canvas';

export const sampleCubicBezier = (p0: TPoint, p1: TPoint, p2: TPoint, p3: TPoint, segments: number): TPoint[] =>
  Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments;
    const oneMinusT = 1 - t;
    const w0 = oneMinusT ** 3;
    const w1 = 3 * oneMinusT ** 2 * t;
    const w2 = 3 * oneMinusT * t ** 2;
    const w3 = t ** 3;

    return {
      x: w0 * p0.x + w1 * p1.x + w2 * p2.x + w3 * p3.x,
      y: w0 * p0.y + w1 * p1.y + w2 * p2.y + w3 * p3.y,
    };
  });
