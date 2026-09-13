// types
import { TEditableGradientStop, TGradientType } from './types';

export const MIN_STOPS = 2;
export const MAX_STOPS = 8;
export const ANGLE_STEP = 90;

export const DEFAULT_GRADIENT_STOPS: TEditableGradientStop[] = [
  { color: '#d9d9d9', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#737373', id: 'stop-2', opacity: 100, position: 1 },
];

export const DEFAULT_GRADIENT_TYPE: TGradientType = 'gradient-linear';

export const GRADIENT_TYPE_LABEL_KEY: Record<TGradientType, string> = {
  'gradient-angular': 'colorPicker.gradient.type.angular',
  'gradient-diamond': 'colorPicker.gradient.type.diamond',
  'gradient-linear': 'colorPicker.gradient.type.linear',
  'gradient-radial': 'colorPicker.gradient.type.radial',
};

export const GRADIENT_TYPE_ORDER: readonly TGradientType[] = ['gradient-linear', 'gradient-radial', 'gradient-angular', 'gradient-diamond'];
