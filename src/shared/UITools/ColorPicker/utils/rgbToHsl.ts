// types
import { TRgb } from 'types/color';
import { THsl } from '../types';

// utils
import { getHueDegrees } from './getHueDegrees';

export const rgbToHsl = (rgb: TRgb): THsl => {
  const { b, g, r } = rgb;
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const delta = max - min;
  const lightness = (max + min) / 2;

  return {
    h: getHueDegrees(rgb),
    l: lightness * 100,
    s: delta === 0 ? 0 : (delta / (1 - Math.abs(2 * lightness - 1))) * 100,
  };
};
