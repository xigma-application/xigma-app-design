// types
import { TPoint } from 'types/canvas';
import { TStrokeRing } from './types';

export const buildStrokeRing = (outer: TPoint[], inner: TPoint[]): TStrokeRing => {
  const mids = outer.map((point, index) => ({ x: (point.x + inner[index].x) / 2, y: (point.y + inner[index].y) / 2 }));
  const lengths = mids.map((point, index) =>
    Math.hypot(mids[(index + 1) % mids.length].x - point.x, mids[(index + 1) % mids.length].y - point.y),
  );
  const cumulative = lengths.map((_, index) => lengths.slice(0, index).reduce((total, length) => total + length, 0));

  return { closed: true, cumulative, inner, lengths, mids, outer, perimeter: lengths.reduce((total, length) => total + length, 0) };
};
