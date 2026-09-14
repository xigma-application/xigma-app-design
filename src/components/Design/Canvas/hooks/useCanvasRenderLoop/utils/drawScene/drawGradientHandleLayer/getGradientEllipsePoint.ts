// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientEllipseNormalizedPoint } from 'components/Design/Canvas/utils/getGradientEllipseNormalizedPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const toWorldPoint = (bounds: TDraftRect, normalized: TPoint): TPoint => ({
  x: bounds.x + normalized.x * bounds.width,
  y: bounds.y + normalized.y * bounds.height,
});

export const getGradientEllipsePoint = (bounds: TDraftRect, rotation: number, paint: TGradientPaint, position: number): TPoint => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const normalized = getGradientEllipseNormalizedPoint(paint, position);

  return rotatePoint(toWorldPoint(bounds, normalized), center, rotation);
};
