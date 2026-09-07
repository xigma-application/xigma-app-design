// types
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

type TParentBox = { height: number; rotation: number; width: number; x: number; y: number };

export const getNodeAbsoluteFromParentPosition = (local: TPoint, parent: TParentBox): TPoint => {
  const center: TPoint = { x: parent.x + parent.width / 2, y: parent.y + parent.height / 2 };
  return rotatePoint({ x: local.x + parent.x, y: local.y + parent.y }, center, parent.rotation);
};
