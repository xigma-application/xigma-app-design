import { CSSProperties } from 'react';

// types
import { TEditableGradientStop, TGradientType } from '../Body/GradientPanel/types';

// utils
import { getGradientCssAngle } from './getGradientCssAngle';
import { getGradientStopsCss } from '../Body/GradientPanel/utils/getGradientStopsCss';

const GRADIENT_STYLE_BY_TYPE: Record<TGradientType, (stopsCss: string, angle: number) => CSSProperties> = {
  'gradient-angular': (stopsCss, angle) => ({ background: `conic-gradient(from ${getGradientCssAngle(angle)}deg, ${stopsCss})` }),
  'gradient-diamond': (stopsCss) => ({ background: `radial-gradient(circle farthest-side, ${stopsCss})` }),
  'gradient-linear': (stopsCss, angle) => ({ background: `linear-gradient(${getGradientCssAngle(angle)}deg, ${stopsCss})` }),
  'gradient-radial': (stopsCss) => ({ background: `radial-gradient(circle farthest-corner, ${stopsCss})` }),
};

export const getGradientPreviewStyle = (stops: TEditableGradientStop[], type: TGradientType, angle = 0): CSSProperties =>
  GRADIENT_STYLE_BY_TYPE[type](getGradientStopsCss(stops), angle);
