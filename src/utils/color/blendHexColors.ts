// utils
import { hexToRgb } from './hexToRgb';
import { rgbToHex } from './rgbToHex';

export const blendHexColors = (topHex: string, bottomHex: string, alpha: number): string => {
  const top = hexToRgb(topHex);
  const bottom = hexToRgb(bottomHex);

  return rgbToHex({
    b: top.b * alpha + bottom.b * (1 - alpha),
    g: top.g * alpha + bottom.g * (1 - alpha),
    r: top.r * alpha + bottom.r * (1 - alpha),
  });
};
