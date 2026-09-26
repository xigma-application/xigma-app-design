// types
import { TGradientPaint, TPaint, TSolidPaint } from 'types/design/paint/types';

export const isColorPaint = (paint: TPaint): paint is TGradientPaint | TSolidPaint =>
  paint.type === 'solid' || paint.type.startsWith('gradient-');
