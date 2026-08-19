// types
import { TPoint } from 'types/canvas';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const rotateShapeNodeOrigin = (
  origin: { height: number; rotation: number; width: number; x: number; y: number },
  pivot: TPoint,
  deltaDegrees: number,
): TSceneNodeChanges => {
  const originCenter = { x: origin.x + origin.width / 2, y: origin.y + origin.height / 2 };
  const newCenter = rotatePoint(originCenter, pivot, deltaDegrees);

  return {
    rotation: Math.round((origin.rotation + deltaDegrees) * 100) / 100,
    x: Math.round(newCenter.x - origin.width / 2),
    y: Math.round(newCenter.y - origin.height / 2),
  };
};
