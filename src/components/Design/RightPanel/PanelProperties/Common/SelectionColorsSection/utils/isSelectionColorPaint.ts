// types
import { TGradientPaint, TPaint, TSolidPaint } from 'types/design/paint/types';

const GRADIENT_PAINT_TYPES = new Set(['gradient-angular', 'gradient-diamond', 'gradient-linear', 'gradient-radial']);

export const isSelectionColorPaint = (paint: TPaint): paint is TSolidPaint | TGradientPaint =>
  paint.type === 'solid' || GRADIENT_PAINT_TYPES.has(paint.type);
