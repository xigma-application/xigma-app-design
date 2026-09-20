// others
import { DEFAULT_PROGRESSIVE_BLUR_END_POINT, DEFAULT_PROGRESSIVE_BLUR_START, DEFAULT_PROGRESSIVE_BLUR_START_POINT } from 'constant/effect';

// types
import { TEffect } from 'types/design/types';
import { TPoint } from 'types/canvas';

export type TProgressiveBlur = { end: TPoint; endBlur: number; start: TPoint; startBlur: number };

export const getProgressiveBlur = (effect: TEffect): TProgressiveBlur => ({
  end: effect.end ?? DEFAULT_PROGRESSIVE_BLUR_END_POINT,
  endBlur: effect.blur,
  start: effect.start ?? DEFAULT_PROGRESSIVE_BLUR_START_POINT,
  startBlur: effect.startBlur ?? DEFAULT_PROGRESSIVE_BLUR_START,
});
