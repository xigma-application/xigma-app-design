// types
import { TGradientPaint, TPaint } from 'types/design/paint/types';

export const isEllipseHandleGradientPaint = (paint: TPaint | undefined): paint is TGradientPaint =>
  paint?.type === 'gradient-radial' || paint?.type === 'gradient-angular' || paint?.type === 'gradient-diamond';
