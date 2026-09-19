// others
import { SIZE_JITTER_SPAN, STAMP_SCALE_MAX, STAMP_SCALE_MIN } from './constants';

// utils
import { clamp } from 'utils/math/clamp';

export const getStampSize = (strokeWidth: number, sizeJitter: number, profileMultiplier: number, random: () => number): number =>
  strokeWidth * clamp(1 + (sizeJitter / 100) * (random() * 2 - 1) * SIZE_JITTER_SPAN, STAMP_SCALE_MIN, STAMP_SCALE_MAX) * profileMultiplier;
