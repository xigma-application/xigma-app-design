// types
import { TBrushScatterPreset } from '../getBrushScatterPreset';
import { TPoint } from 'types/canvas';
import { TScatterDot } from './types';

// others
import { CLOUD_RADIUS, DOT_RADIUS_RATIO, MIN_DOT_RADIUS } from './constants';

// utils
import { getGaussian } from './getGaussian';

export const getStampDots = (
  center: TPoint,
  angle: number,
  size: number,
  preset: TBrushScatterPreset,
  dotsPerStamp: number,
  random: () => number,
): TScatterDot[] => {
  const radius = Math.max(DOT_RADIUS_RATIO * preset.dotScale * size, MIN_DOT_RADIUS);
  const limit = CLOUD_RADIUS * size;
  const dots: TScatterDot[] = [];

  for (let dot = 0; size > 0 && dot < dotsPerStamp; dot += 1) {
    const gx = getGaussian(random) * preset.sigma * size;
    const gy = getGaussian(random) * preset.sigma * size;
    const shrink = Math.hypot(gx, gy) > limit ? limit / Math.hypot(gx, gy) : 1;
    const localX = gx * shrink * preset.aspect;
    const localY = gy * shrink;

    dots.push({
      radius,
      x: center.x + localX * Math.cos(angle) - localY * Math.sin(angle),
      y: center.y + localX * Math.sin(angle) + localY * Math.cos(angle),
    });
  }

  return dots;
};
