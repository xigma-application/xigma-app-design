// types
import { TRgb } from 'types/color';

// utils
import { getRelativeLuminance } from './getRelativeLuminance';

export const getContrastRatio = (a: TRgb, b: TRgb): number => {
  const luminanceA = getRelativeLuminance(a);
  const luminanceB = getRelativeLuminance(b);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);

  return (lighter + 0.05) / (darker + 0.05);
};
