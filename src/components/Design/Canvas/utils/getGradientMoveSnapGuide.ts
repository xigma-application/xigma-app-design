// types
import { TAlignmentGuide } from './getGroupAlignmentGuide';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getGradientMoveSnapGuide = (
  normalizedPoint: TPoint,
  bounds: TDraftRect,
  rotation: number,
  snappedX: boolean,
  snappedY: boolean,
): TAlignmentGuide | null => {
  if (!snappedX && !snappedY) {
    return null;
  }

  const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const toWorld = (point: TPoint): TPoint => (rotation === 0 ? point : rotatePoint(point, boundsCenter, rotation));
  const localX = bounds.x + normalizedPoint.x * bounds.width;
  const localY = bounds.y + normalizedPoint.y * bounds.height;

  return {
    horizontal: snappedY
      ? { anchor: toWorld({ x: bounds.x, y: localY }), match: toWorld({ x: bounds.x + bounds.width, y: localY }) }
      : null,
    vertical: snappedX ? { anchor: toWorld({ x: localX, y: bounds.y }), match: toWorld({ x: localX, y: bounds.y + bounds.height }) } : null,
  };
};
