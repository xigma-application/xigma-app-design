// types
import { TRgb } from 'types/color';
import { THsv } from '../types';

// utils
import { getHueDegrees } from './getHueDegrees';

export const rgbToHsv = (rgb: TRgb): THsv => {
  const { b, g, r } = rgb;
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const delta = max - min;

  return {
    h: getHueDegrees(rgb),
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  };
};
