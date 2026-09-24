// types
import { TBatchShape, TRectChunkBounds } from './types';

// utils
import { getShapeStrokeReach } from './getShapeStrokeReach';

export const getRectChunkBounds = (nodes: TBatchShape[]): TRectChunkBounds => {
  const bounds: TRectChunkBounds = { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity };

  nodes.forEach((node) => {
    const stroke = getShapeStrokeReach(node);
    const reach = node.rotation ? Math.hypot(node.width, node.height) / 2 : 0;
    const centerX = node.x + node.width / 2;
    const centerY = node.y + node.height / 2;
    const halfWidth = (reach || node.width / 2) + stroke;
    const halfHeight = (reach || node.height / 2) + stroke;

    bounds.minX = Math.min(bounds.minX, centerX - halfWidth);
    bounds.minY = Math.min(bounds.minY, centerY - halfHeight);
    bounds.maxX = Math.max(bounds.maxX, centerX + halfWidth);
    bounds.maxY = Math.max(bounds.maxY, centerY + halfHeight);
  });

  return bounds;
};
