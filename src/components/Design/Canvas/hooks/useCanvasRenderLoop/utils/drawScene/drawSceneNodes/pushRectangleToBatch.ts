// types
import { TViewport } from 'types/design/types';
import { TBatchShape, TRectBatch } from 'utils/canvas/drawRectBatch/types';

// utils
import { appendShapeTriangles } from 'utils/canvas/drawRectBatch/appendShapeTriangles';
import { getShapeStrokeReach } from 'utils/canvas/drawRectBatch/getShapeStrokeReach';

const isOutsideViewport = (node: TBatchShape, canvasWidth: number, canvasHeight: number, viewport: TViewport): boolean => {
  const stroke = getShapeStrokeReach(node);
  const halfWidth = (node.rotation ? Math.hypot(node.width, node.height) / 2 : node.width / 2) + stroke;
  const halfHeight = node.rotation ? halfWidth : node.height / 2 + stroke;
  const centerX = (node.x + node.width / 2) * viewport.zoom + viewport.x;
  const centerY = (node.y + node.height / 2) * viewport.zoom + viewport.y;

  return (
    centerX + halfWidth * viewport.zoom < 0 ||
    centerY + halfHeight * viewport.zoom < 0 ||
    centerX - halfWidth * viewport.zoom > canvasWidth ||
    centerY - halfHeight * viewport.zoom > canvasHeight
  );
};

export const pushRectangleToBatch = (
  batch: TRectBatch,
  node: TBatchShape,
  opacity: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (!isOutsideViewport(node, canvasWidth, canvasHeight, viewport)) {
    appendShapeTriangles(batch, node, opacity);
  }
};
