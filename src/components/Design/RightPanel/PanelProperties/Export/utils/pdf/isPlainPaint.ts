// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

const SUPPORTED_PAINT_TYPES: TPaint['type'][] = ['solid', 'gradient-linear', 'gradient-radial', 'gradient-angular', 'gradient-diamond'];

export const isPlainPaint = (paint: TPaint): boolean =>
  paint.visible === false || (SUPPORTED_PAINT_TYPES.includes(paint.type) && (!paint.blendMode || paint.blendMode === BlendMode.normal));
