// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeBounds } from '../getNodeBounds';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getUnrotatedNodeQueryPoint = (point: TPoint, node: TSceneNode): TPoint => {
  if (node.type === NodeType.line || node.type === NodeType.vector || node.rotation === 0) {
    return point;
  }

  const bounds = getNodeBounds(node);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return rotatePoint(point, center, -node.rotation);
};
