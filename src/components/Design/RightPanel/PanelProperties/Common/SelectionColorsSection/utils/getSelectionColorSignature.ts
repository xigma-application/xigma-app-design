// types
import { BlendMode } from 'types/design/enums';
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';

export const getSelectionColorSignature = (paint: TSolidPaint | TGradientPaint): string => {
  const blendMode = paint.blendMode ?? BlendMode.normal;

  switch (paint.type) {
    case 'solid':
      return `solid|${paint.color.toUpperCase()}|${paint.opacity}|${blendMode}`;
    default:
      return [
        paint.type,
        JSON.stringify(paint.stops),
        JSON.stringify(paint.start),
        JSON.stringify(paint.end),
        paint.radiusRatio ?? '',
        paint.opacity,
        blendMode,
      ].join('|');
  }
};
