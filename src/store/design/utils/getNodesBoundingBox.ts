// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeAxisAlignedBounds } from './getNodeAxisAlignedBounds';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { rotatePoint } from 'utils/math/rotatePoint';

const getNodeRotatedBounds = (node: TSceneNode): TDraftRect => {
  const bounds = getNodeAxisAlignedBounds(node);

  if (node.type === NodeType.line || node.type === NodeType.vector || node.rotation === 0) {
    return bounds;
  }

  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const corners = getRectCorners(bounds).map((corner) => rotatePoint(corner, center, node.rotation));
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
};

export const getNodesBoundingBox = (nodes: TSceneNode[]): TDraftRect => {
  const bounds = nodes.map(getNodeRotatedBounds);
  const minX = Math.min(...bounds.map((bound) => bound.x));
  const minY = Math.min(...bounds.map((bound) => bound.y));
  const maxX = Math.max(...bounds.map((bound) => bound.x + bound.width));
  const maxY = Math.max(...bounds.map((bound) => bound.y + bound.height));

  return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
};
