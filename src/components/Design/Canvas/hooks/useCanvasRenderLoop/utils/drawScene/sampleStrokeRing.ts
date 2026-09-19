// types
import { TStrokeRing, TStrokeRingSample } from './types';

const findSegment = (ring: TStrokeRing, distance: number): number => {
  let low = 0;
  let high = ring.cumulative.length - 1;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);

    if (ring.cumulative[middle] <= distance) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return low;
};

export const sampleStrokeRing = (ring: TStrokeRing, distance: number): TStrokeRingSample => {
  const wrapped = ((distance % ring.perimeter) + ring.perimeter) % ring.perimeter;
  const count = ring.mids.length;
  let index = findSegment(ring, wrapped);

  while (ring.lengths[index] === 0 && index < count - 1) {
    index += 1;
  }

  const next = (index + 1) % count;
  const length = ring.lengths[index] || 1;
  const t = ring.lengths[index] > 0 ? (wrapped - ring.cumulative[index]) / length : 0;
  const mid = {
    x: ring.mids[index].x + (ring.mids[next].x - ring.mids[index].x) * t,
    y: ring.mids[index].y + (ring.mids[next].y - ring.mids[index].y) * t,
  };
  const outerX = ring.outer[index].x + (ring.outer[next].x - ring.outer[index].x) * t;
  const outerY = ring.outer[index].y + (ring.outer[next].y - ring.outer[index].y) * t;

  return {
    mid,
    tangent: { x: (ring.mids[next].x - ring.mids[index].x) / length, y: (ring.mids[next].y - ring.mids[index].y) / length },
    vec: { x: outerX - mid.x, y: outerY - mid.y },
  };
};
