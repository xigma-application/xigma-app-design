// utils
import { getContrastRatio } from './getContrastRatio';
import { hexToRgb } from './hexToRgb';

export const isLightColor = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  return getContrastRatio(rgb, { b: 0, g: 0, r: 0 }) > getContrastRatio(rgb, { b: 255, g: 255, r: 255 });
};
