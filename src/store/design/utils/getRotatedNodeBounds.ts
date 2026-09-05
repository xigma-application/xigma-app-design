// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeAxisAlignedBounds } from './getNodeAxisAlignedBounds';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getRotatedNodeBounds = (node: TSceneNode): TDraftRect => {
  const bounds = getNodeAxisAlignedBounds(node);
  let rotatedBounds = bounds;

  if (node.type !== NodeType.line && node.type !== NodeType.vector && node.rotation !== 0) {
    const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const corners = getRectCorners(bounds).map((corner) => rotatePoint(corner, center, node.rotation));
    const xs = corners.map((corner) => corner.x);
    const ys = corners.map((corner) => corner.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    rotatedBounds = { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
  }

  return rotatedBounds;
};
