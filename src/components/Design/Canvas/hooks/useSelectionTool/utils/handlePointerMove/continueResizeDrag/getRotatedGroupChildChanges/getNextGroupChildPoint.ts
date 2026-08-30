// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getNextGroupChildPoint = (
  groupOrigin: TDraftRect,
  groupRotation: number,
  newGroupBox: TDraftRect,
  mirror: TPoint,
): ((worldPoint: TPoint) => TPoint) => {
  const oldCenter: TPoint = { x: groupOrigin.x + groupOrigin.width / 2, y: groupOrigin.y + groupOrigin.height / 2 };
  const newCenter: TPoint = { x: newGroupBox.x + newGroupBox.width / 2, y: newGroupBox.y + newGroupBox.height / 2 };

  return (worldPoint: TPoint): TPoint => {
    const local = rotatePoint(worldPoint, oldCenter, -groupRotation);
    const u = groupOrigin.width === 0 ? 0.5 : (local.x - groupOrigin.x) / groupOrigin.width;
    const v = groupOrigin.height === 0 ? 0.5 : (local.y - groupOrigin.y) / groupOrigin.height;
    const nu = mirror.x < 0 ? 1 - u : u;
    const nv = mirror.y < 0 ? 1 - v : v;

    return rotatePoint({ x: newGroupBox.x + nu * newGroupBox.width, y: newGroupBox.y + nv * newGroupBox.height }, newCenter, groupRotation);
  };
};
