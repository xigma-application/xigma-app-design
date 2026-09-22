// types
import { TGradientPaint, TPaint } from 'types/design/paint/types';

const GRADIENT_PAINT_TYPES: TPaint['type'][] = ['gradient-angular', 'gradient-diamond', 'gradient-linear', 'gradient-radial'];

const isGradientPaint = (paint: TPaint): paint is TGradientPaint => GRADIENT_PAINT_TYPES.includes(paint.type);

export const isOpaqueGradientPaint = (paint: TPaint): boolean =>
  !isGradientPaint(paint) || paint.stops.every((stop) => stop.opacity === 100);
