// types
import { TStretchOctave } from './types';

// others
import { THIN_ROUGHNESS_BOOST } from './constants';

// utils
import { clamp } from 'utils/math/clamp';
import { getStretchNoise } from './getStretchNoise';

export const getStretchRoughness = (octaves: TStretchOctave[], distance: number, multiplier: number, roughness: number): number =>
  1 + roughness * (1 + THIN_ROUGHNESS_BOOST * (1 - clamp(multiplier, 0, 1))) * getStretchNoise(octaves, distance);
