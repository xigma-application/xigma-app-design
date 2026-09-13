import { CSSProperties } from 'react';

// types
import { TEditableGradientStop, TGradientType } from '../Body/GradientPanel/types';

// utils
import { getGradientStopsCss } from '../Body/GradientPanel/utils/getGradientStopsCss';

const GRADIENT_STYLE_BY_TYPE: Record<TGradientType, (stopsCss: string) => CSSProperties> = {
  'gradient-angular': (stopsCss) => ({ background: `conic-gradient(${stopsCss})` }),
  'gradient-diamond': (stopsCss) => ({ background: `radial-gradient(circle farthest-side, ${stopsCss})` }),
  'gradient-linear': (stopsCss) => ({ background: `linear-gradient(to right, ${stopsCss})` }),
  'gradient-radial': (stopsCss) => ({ background: `radial-gradient(circle farthest-corner, ${stopsCss})` }),
};

export const getGradientPreviewStyle = (stops: TEditableGradientStop[], type: TGradientType): CSSProperties =>
  GRADIENT_STYLE_BY_TYPE[type](getGradientStopsCss(stops));
