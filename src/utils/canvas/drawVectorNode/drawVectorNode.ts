// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../vectorNetwork/deriveVectorFaces';
import { drawVectorFill } from './drawVectorFill';
import { drawVectorStroke } from './drawVectorStroke';
import { flattenVectorSegments } from '../vectorNetwork/flattenVectorSegments';

export const drawVectorNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (node.fillColor) {
    drawVectorFill(gl, program, buffer, deriveVectorFaces(node), node.fillColor, canvasWidth, canvasHeight, viewport);
  }

  drawVectorStroke(
    gl,
    program,
    buffer,
    flattenVectorSegments(node),
    node.strokeColor,
    node.strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
