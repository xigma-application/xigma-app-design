// types
import { TRgb } from './types';

// utils
import { hexToRgbFloat } from '../hexToRgbFloat';

const rgbByHex = new Map<string, TRgb>();

export const getSolidFillColor = (hex: string): TRgb => {
  const cached = rgbByHex.get(hex);

  if (!cached) {
    const rgb = hexToRgbFloat(hex);
    rgbByHex.set(hex, rgb);

    return rgb;
  }

  return cached;
};
