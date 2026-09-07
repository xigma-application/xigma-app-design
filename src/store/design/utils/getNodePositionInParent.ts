// types
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

type TParentBox = { height: number; rotation: number; width: number; x: number; y: number };

export const getNodePositionInParent = (node: TPoint, parent: TParentBox): TPoint => {
  const center: TPoint = { x: parent.x + parent.width / 2, y: parent.y + parent.height / 2 };
  const local = rotatePoint({ x: node.x, y: node.y }, center, -parent.rotation);

  return { x: local.x - parent.x, y: local.y - parent.y };
};
