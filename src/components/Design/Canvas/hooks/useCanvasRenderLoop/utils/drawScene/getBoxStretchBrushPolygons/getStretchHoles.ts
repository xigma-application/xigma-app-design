// types
import { TPoint } from 'types/canvas';
import { TStrokeRing } from '../types';
import { TStretchMultiplier } from './types';

// others
import { HOLE_SPACING } from './constants';

// utils
import { getStretchHole } from './getStretchHole';
import { sampleStrokeRing } from '../sampleStrokeRing';

export const getStretchHoles = (
  ring: TStrokeRing,
  density: number,
  strokeWidth: number,
  random: () => number,
  getMultiplier: TStretchMultiplier,
): TPoint[][] =>
  Array.from({ length: Math.floor((ring.perimeter / (strokeWidth * HOLE_SPACING)) * density) }, () => {
    const distance = random() * ring.perimeter;
    return getStretchHole(sampleStrokeRing(ring, distance), getMultiplier(distance), strokeWidth, random);
  });
