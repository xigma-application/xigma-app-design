// types
import { TDrawSceneContext } from '../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorFill } from 'utils/canvas/drawVectorNode/drawVectorFill';
import { drawVectorFillGroup } from './drawVectorFillGroup';
import { drawVectorRoundedCaps } from 'utils/canvas/drawVectorNode/drawVectorRoundedCaps';
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';
import { drawVectorVariableStroke } from './drawVectorVariableStroke';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { getVectorStrokeShape } from 'utils/canvas/vector/stroke/getVectorStrokeShape';
import { getVectorNodeThickStrokeVertices } from 'utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';
import { withPaintsOpacity } from 'utils/design/paint/withPaintsOpacity';

export const drawVectorNode = (context: TDrawSceneContext, node: TVectorNode, opacity = 1): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { faceBufferCache, strokeBufferCache } = imageContext;
  const renderedNode = getRenderedVectorNode(node);
  const nodeBounds = getVectorNodeBounds(renderedNode);
  const strokeShapes = getVectorStrokeShape(renderedNode);

  groupFilledFacesForRendering(renderedNode).forEach(({ paint, polygons }) => {
    drawVectorFillGroup(context, faceBufferCache, nodeBounds, polygons, withPaintsOpacity(paint, opacity));
  });

  if (strokeShapes) {
    strokeShapes.forEach(({ fillRule, polygons }) => {
      drawVectorFill(
        gl,
        program,
        buffer,
        null,
        null,
        polygons,
        renderedNode.strokeColor,
        canvasWidth,
        canvasHeight,
        viewport,
        imageContext.isAlphaWriteEnabled,
        opacity,
        fillRule,
      );
    });
  } else if (renderedNode.widthProfile) {
    drawVectorVariableStroke(gl, program, buffer, renderedNode, renderedNode.strokeColor, canvasWidth, canvasHeight, viewport, opacity);
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
      opacity,
    );
  }

  drawVectorRoundedCaps(gl, program, buffer, renderedNode, canvasWidth, canvasHeight, viewport, opacity);
};
