// types
import { TStrokeRing } from './types';

const DISTANCE_EPSILON = 1e-6;

export const getStrokeRingDistances = (ring: TStrokeRing, step: number): number[] => {
  const grid = Array.from({ length: Math.floor(ring.perimeter / step) + 1 }, (_, index) => index * step);
  const sorted = [...ring.cumulative, ...grid].filter((distance) => distance < ring.perimeter).sort((first, second) => first - second);

  return sorted.filter((distance, index) => index === 0 || distance - sorted[index - 1] > DISTANCE_EPSILON);
};
