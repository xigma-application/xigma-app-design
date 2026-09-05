// types
import { TDrawSceneContext } from '../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { drawVectorRoundedCaps } from 'utils/canvas/drawVectorNode/drawVectorRoundedCaps';
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';
import { drawVectorVariableStroke } from './drawVectorVariableStroke';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { getVectorNodeThickStrokeVertices } from 'utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

export const drawVectorNode = (context: TDrawSceneContext, node: TVectorNode): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { faceBufferCache, isAlphaWriteEnabled, strokeBufferCache } = imageContext;
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
