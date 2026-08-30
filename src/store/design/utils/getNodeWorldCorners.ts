// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeAxisAlignedBounds } from './getNodeAxisAlignedBounds';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getNodeWorldCorners = (node: TSceneNode): TPoint[] => {
  const bounds = getNodeAxisAlignedBounds(node);
  const corners = getRectCorners(bounds);

  if (node.type === NodeType.line || node.type === NodeType.vector || node.rotation === 0) {
    return corners;
  }

  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  return corners.map((corner) => rotatePoint(corner, center, node.rotation));
};
