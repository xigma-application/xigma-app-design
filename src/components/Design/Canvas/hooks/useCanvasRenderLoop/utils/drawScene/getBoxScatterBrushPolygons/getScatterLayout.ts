// types
import { TScatterLayout } from './types';

// others
import { MIN_DOTS_PER_STAMP } from './constants';
import { STROKE_BRUSH_MAX_DOTS, STROKE_BRUSH_MAX_STAMPS } from 'constant/strokeBrush';

// utils
import { clamp } from 'utils/math/clamp';

export const getScatterLayout = (perimeter: number, gap: number, strokeWidth: number, presetDots: number): TScatterLayout => {
  const pitch = Math.max((gap / 100) * strokeWidth, perimeter / STROKE_BRUSH_MAX_STAMPS);
  const stampCount = Math.ceil(perimeter / pitch);

  return { dotsPerStamp: clamp(Math.floor(STROKE_BRUSH_MAX_DOTS / stampCount), MIN_DOTS_PER_STAMP, presetDots), pitch, stampCount };
};
