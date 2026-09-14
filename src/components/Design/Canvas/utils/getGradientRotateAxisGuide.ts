// types
import { TAlignmentGuide } from './getGroupAlignmentGuide';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getGradientRotateAxisGuide = (
  pivot: TPoint,
  bounds: TDraftRect,
  rotation: number,
  snappedAngleDegrees: number,
): TAlignmentGuide => {
  const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const toWorld = (point: TPoint): TPoint => (rotation === 0 ? point : rotatePoint(point, boundsCenter, rotation));
  const isHorizontal = ((snappedAngleDegrees % 180) + 180) % 180 === 0;

  if (isHorizontal) {
    return {
      horizontal: { anchor: toWorld({ x: bounds.x, y: pivot.y }), match: toWorld({ x: bounds.x + bounds.width, y: pivot.y }) },
      vertical: null,
    };
  }

  return {
    horizontal: null,
    vertical: { anchor: toWorld({ x: pivot.x, y: bounds.y }), match: toWorld({ x: pivot.x, y: bounds.y + bounds.height }) },
  };
};
