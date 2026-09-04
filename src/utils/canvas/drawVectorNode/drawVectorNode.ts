// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorFillPaints } from './drawVectorFillPaints';
import { drawVectorRoundedCaps } from './drawVectorRoundedCaps';
import { drawVectorThickStrokeVertices } from './drawVectorThickStrokeVertices';
import { drawVectorVariableStroke } from './drawVectorVariableStroke';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorNodeBounds } from '../vectorNetwork/getVectorNodeBounds';
import { getVectorNodeThickStrokeVertices } from '../vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';
import { groupFilledFacesForRendering } from './groupFilledFacesForRendering';

export const drawVectorNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer>,
  strokeBufferCache: WeakMap<number[], WebGLBuffer>,
  node: TVectorNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
): void => {
  const renderedNode = getRenderedVectorNode(node);
  const nodeBounds = getVectorNodeBounds(renderedNode);

  groupFilledFacesForRendering(renderedNode).forEach(({ paint, polygons }) => {
    drawVectorFillPaints(
      gl,
      program,
      buffer,
      faceBufferCache,
      nodeBounds,
      polygons,
      paint,
      canvasWidth,
      canvasHeight,
      viewport,
      isAlphaWriteEnabled,
    );
  });

  if (renderedNode.widthProfile) {
    drawVectorVariableStroke(gl, program, buffer, renderedNode, renderedNode.strokeColor, canvasWidth, canvasHeight, viewport);
  } else {
    const strokeVertices = getVectorNodeThickStrokeVertices(renderedNode, renderedNode.strokeWidth / 2);
    drawVectorThickStrokeVertices(
      gl,
      program,
      buffer,
      strokeBufferCache,
      strokeVertices,
      renderedNode.strokeColor,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }

  drawVectorRoundedCaps(gl, program, buffer, renderedNode, canvasWidth, canvasHeight, viewport);
};
