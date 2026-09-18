// others
import { getRelativeLuminance } from 'utils/color/getRelativeLuminance';
import { hsvToRgbFloat } from './hsvToRgbFloat';

const LUMINANCE_EPSILON = 0.0005;
const BINARY_SEARCH_STEPS = 24;

export const findVForLuminance = (hue: number, saturation: number, targetLuminance: number): number | null => {
  const maxLuminance = getRelativeLuminance(hsvToRgbFloat({ h: hue, s: saturation, v: 100 }));

  if (targetLuminance < -LUMINANCE_EPSILON || targetLuminance > maxLuminance + LUMINANCE_EPSILON) {
    return null;
  }

  let low = 0;
  let high = 100;

  for (let step = 0; step < BINARY_SEARCH_STEPS; step += 1) {
    const mid = (low + high) / 2;
    const luminance = getRelativeLuminance(hsvToRgbFloat({ h: hue, s: saturation, v: mid }));

    if (luminance < targetLuminance) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
};
