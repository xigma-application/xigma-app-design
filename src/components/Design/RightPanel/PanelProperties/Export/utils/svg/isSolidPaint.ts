// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

export const isSolidPaint = (paint: TPaint): boolean =>
  paint.visible === false || (paint.type === 'solid' && (!paint.blendMode || paint.blendMode === BlendMode.normal));
