// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientRadiusHandleNormalizedPoint } from 'components/Design/Canvas/utils/getGradientRadiusHandleNormalizedPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const toWorldPoint = (bounds: TDraftRect, normalized: TPoint): TPoint => ({
  x: bounds.x + normalized.x * bounds.width,
  y: bounds.y + normalized.y * bounds.height,
});

export const getGradientRadiusHandleWorldPoint = (bounds: TDraftRect, rotation: number, paint: TGradientPaint): TPoint => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const normalized = getGradientRadiusHandleNormalizedPoint(paint);

  return rotatePoint(toWorldPoint(bounds, normalized), center, rotation);
};
