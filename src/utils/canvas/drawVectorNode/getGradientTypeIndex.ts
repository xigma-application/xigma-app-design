// types
import { TGradientPaint } from 'types/design/paint/types';

const GRADIENT_TYPE_INDEX: Record<TGradientPaint['type'], number> = {
  'gradient-angular': 2,
  'gradient-diamond': 3,
  'gradient-linear': 0,
  'gradient-radial': 1,
};

export const getGradientTypeIndex = (type: TGradientPaint['type']): number => GRADIENT_TYPE_INDEX[type];
