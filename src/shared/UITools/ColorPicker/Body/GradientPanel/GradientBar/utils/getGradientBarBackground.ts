// types
import { TEditableGradientStop } from '../../types';

// utils
import { getGradientStopsCss } from '../../utils/getGradientStopsCss';

export const getGradientBarBackground = (stops: TEditableGradientStop[]): string =>
  `linear-gradient(to right, ${getGradientStopsCss(stops)})`;
