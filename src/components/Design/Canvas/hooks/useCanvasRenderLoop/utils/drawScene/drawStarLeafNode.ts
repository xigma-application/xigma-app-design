// types
import { TDrawContext } from './types';
import { TStarNode } from 'types/design/types';

// utils
import { drawStar } from 'utils/canvas/drawStar/drawStar';

export const drawStarLeafNode = (context: TDrawContext, node: TStarNode, dragOpacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  drawStar(
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
