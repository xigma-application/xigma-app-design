// types
import { TEditableGradientStop } from '../types';

// utils
import { hexToRgb } from 'utils/color/hexToRgb';
import { rgbToCssString } from 'utils/color/rgbToCssString';

export const getGradientStopsCss = (stops: TEditableGradientStop[]): string =>
  [...stops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${rgbToCssString({ ...hexToRgb(stop.color), a: stop.opacity })} ${stop.position * 100}%`)
    .join(', ');
