// types
import { TDropDepthRange } from '../../../../types';

// utils
import { clamp } from 'utils/math/clamp';

export const getDropDepth = (pointerX: number, containerLeft: number, indentPx: number, range: TDropDepthRange): number => {
  const rawDepth = Math.round((pointerX - containerLeft) / indentPx);
  return clamp(rawDepth, range.min, range.max);
};
