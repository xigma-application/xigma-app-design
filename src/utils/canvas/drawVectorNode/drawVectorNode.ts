// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorFill } from './drawVectorFill';
import { drawVectorRoundedCaps } from './drawVectorRoundedCaps';
import { drawVectorThickStrokeVertices } from './drawVectorThickStrokeVertices';
import { drawVectorVariableStroke } from './drawVectorVariableStroke';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorNodeThickStrokeVertices } from '../vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';
import { groupFilledFacesByColor } from './groupFilledFacesByColor';

export const drawVectorNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer>,
  node: TVectorNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const renderedNode = getRenderedVectorNode(node);

  groupFilledFacesByColor(renderedNode).forEach((faces, color) => {
    drawVectorFill(gl, program, buffer, faceBufferCache, faces, color, canvasWidth, canvasHeight, viewport);
  });

  if (renderedNode.widthProfile) {
    drawVectorVariableStroke(gl, program, buffer, renderedNode, renderedNode.strokeColor, canvasWidth, canvasHeight, viewport);
  } else {
    const strokeVertices = getVectorNodeThickStrokeVertices(renderedNode, renderedNode.strokeWidth / 2);
    drawVectorThickStrokeVertices(gl, program, buffer, strokeVertices, renderedNode.strokeColor, canvasWidth, canvasHeight, viewport);
  }

  drawVectorRoundedCaps(gl, program, buffer, renderedNode, canvasWidth, canvasHeight, viewport);
};
