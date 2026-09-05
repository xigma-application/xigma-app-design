// types
import { TDrawContext } from './types';
import { TPolygonNode } from 'types/design/types';

// utils
import { drawPolygon } from 'utils/canvas/drawPolygon/drawPolygon';

export const drawPolygonLeafNode = (context: TDrawContext, node: TPolygonNode, dragOpacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  drawPolygon(
    gl,
    program,
    buffer,
    { ...node, fillAlpha: dragOpacity },
    canvasWidth,
    canvasHeight,
    viewport,
    node.flipX,
    node.flipY,
    node.rotation,
  );
};
