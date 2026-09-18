// types
import { TStrokeSide, TStrokeSidesChange, TStrokeSideSource } from './types';

// utils
import { getStrokeSideWidths } from './getStrokeSideWidths';
import { STROKE_SIDE_WIDTH_KEYS } from './constants';

export const getStrokeSideWidthChange = (node: TStrokeSideSource, side: TStrokeSide, width: number): TStrokeSidesChange => {
  const next = { ...getStrokeSideWidths(node), [side]: width };
  return { [STROKE_SIDE_WIDTH_KEYS[side]]: width, strokeWidth: Math.max(next.bottom, next.left, next.right, next.top) };
};
