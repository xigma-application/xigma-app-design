// types
import { TPoint } from 'types/canvas';
import { TStrokeRing } from '../types';
import { TStretchBrushOptions } from './types';

// utils
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { createStretchOctaves } from './createStretchOctaves';
import { getBrushStretchPreset } from '../getBrushStretchPreset';
import { getStretchEdges } from './getStretchEdges';
import { getStretchHoles } from './getStretchHoles';
import { getStretchMultiplier } from './getStretchMultiplier';
import { getStretchStep } from './getStretchStep';

export const getBoxStretchBrushPolygons = (
  ring: TStrokeRing,
  { direction, flipped, index, profile, seed, strokeWidth }: TStretchBrushOptions,
): TPoint[][] | null => {
  if (ring.perimeter > 0 && strokeWidth > 0) {
    const preset = getBrushStretchPreset(index);
    const random = createSeededRandom(seed);
    const baseWavelength = strokeWidth * preset.wavelength;
    const outerOctaves = createStretchOctaves(random, ring.perimeter, baseWavelength);
    const innerOctaves = createStretchOctaves(random, ring.perimeter, baseWavelength);
    const getMultiplier = (distance: number): number =>
      getStretchMultiplier(distance, ring.perimeter, direction, preset.taperEnd, profile, flipped);
    const edges = getStretchEdges(
      ring,
      outerOctaves,
      innerOctaves,
      preset.roughness,
      getStretchStep(outerOctaves, ring.perimeter),
      getMultiplier,
    );
    const holes = getStretchHoles(ring, preset.holes, strokeWidth, random, getMultiplier);

    return ring.closed ? [edges.outer, edges.inner, ...holes] : [[...edges.outer, ...[...edges.inner].reverse()], ...holes];
  }

  return null;
};
