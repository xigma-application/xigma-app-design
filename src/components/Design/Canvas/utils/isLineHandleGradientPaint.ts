// types
import { TGradientPaint, TPaint } from 'types/design/paint/types';

export const isLineHandleGradientPaint = (paint: TPaint | undefined): paint is TGradientPaint =>
  paint?.type === 'gradient-linear' ||
  paint?.type === 'gradient-radial' ||
  paint?.type === 'gradient-angular' ||
  paint?.type === 'gradient-diamond';
