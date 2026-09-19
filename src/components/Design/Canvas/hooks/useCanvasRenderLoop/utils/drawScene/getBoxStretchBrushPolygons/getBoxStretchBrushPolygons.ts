// types
import { TPoint } from 'types/canvas';
import { TStretchBrushOptions } from './types';

// utils
import { buildStrokeRing } from '../buildStrokeRing';
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { createStretchOctaves } from './createStretchOctaves';
import { getBrushStretchPreset } from '../getBrushStretchPreset';
import { getStretchEdges } from './getStretchEdges';
import { getStretchHoles } from './getStretchHoles';
import { getStretchMultiplier } from './getStretchMultiplier';
import { getStretchStep } from './getStretchStep';

export const getBoxStretchBrushPolygons = (
  outer: TPoint[],
  inner: TPoint[],
  { direction, flipped, index, profile, seed, strokeWidth }: TStretchBrushOptions,
): TPoint[][] | null => {
  const ring = buildStrokeRing(outer, inner);

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

    return [edges.outer, edges.inner, ...getStretchHoles(ring, preset.holes, strokeWidth, random, getMultiplier)];
  }

  return null;
};
