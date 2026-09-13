// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export type TGradientWorldPoints = { end: TPoint; start: TPoint };

const toWorldPoint = (bounds: TDraftRect, normalized: TPoint): TPoint => ({
  x: bounds.x + normalized.x * bounds.width,
  y: bounds.y + normalized.y * bounds.height,
});

export const getGradientWorldPoints = (bounds: TDraftRect, rotation: number, paint: TGradientPaint): TGradientWorldPoints => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return {
    end: rotatePoint(toWorldPoint(bounds, paint.end), center, rotation),
    start: rotatePoint(toWorldPoint(bounds, paint.start), center, rotation),
  };
};
