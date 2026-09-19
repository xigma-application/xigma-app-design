// types
import { TPoint } from 'types/canvas';
import { TStrokeRing } from '../types';
import { TStretchMultiplier, TStretchOctave } from './types';

// utils
import { getStretchRoughness } from './getStretchRoughness';
import { getStrokeRingDistances } from '../getStrokeRingDistances';
import { sampleStrokeRing } from '../sampleStrokeRing';

export type TStretchEdges = { inner: TPoint[]; outer: TPoint[] };

export const getStretchEdges = (
  ring: TStrokeRing,
  outerOctaves: TStretchOctave[],
  innerOctaves: TStretchOctave[],
  roughness: number,
  step: number,
  getMultiplier: TStretchMultiplier,
): TStretchEdges => {
  const outer: TPoint[] = [];
  const inner: TPoint[] = [];

  getStrokeRingDistances(ring, step).forEach((distance) => {
    const sample = sampleStrokeRing(ring, distance);
    const multiplier = getMultiplier(distance);
    const outerScale = multiplier * getStretchRoughness(outerOctaves, distance, multiplier, roughness);
    const innerScale = multiplier * getStretchRoughness(innerOctaves, distance, multiplier, roughness);

    outer.push({ x: sample.mid.x + sample.vec.x * outerScale, y: sample.mid.y + sample.vec.y * outerScale });
    inner.push({ x: sample.mid.x - sample.vec.x * innerScale, y: sample.mid.y - sample.vec.y * innerScale });
  });

  return { inner, outer };
};
