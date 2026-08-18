// utils
import { hexToRgbFloat } from './hexToRgbFloat';

export const hexToRgbaFloat = (hex: string, alpha = 1): [number, number, number, number] => {
  const [r, g, b] = hexToRgbFloat(hex);
  return [r, g, b, alpha];
};
