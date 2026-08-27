// others
import { CSS_RGBA_PATTERN } from '../constants';

// types
import { TColorPickerValue } from '../../../../../types';

// utils
import { clamp } from 'utils/math/clamp';
import { rgbToHex } from 'utils/color/rgbToHex';

export const parseCssColor = (value: string): TColorPickerValue | null => {
  const match = value.trim().match(CSS_RGBA_PATTERN);

  if (match) {
    const [, r, g, b, a] = match;
    const rgb = { b: clamp(Number(b), 0, 255), g: clamp(Number(g), 0, 255), r: clamp(Number(r), 0, 255) };
    const alpha = a === undefined ? 100 : clamp(Math.round(Number(a) * 100), 0, 100);

    return { alpha, hex: rgbToHex(rgb) };
  }

  return null;
};
