// types
import { TDrawSceneContext } from '../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorFillGroup } from './drawVectorFillGroup';
import { drawVectorSolidStroke } from './drawVectorSolidStroke';
import { getDrawnVectorNode } from 'utils/canvas/render/getDrawnVectorNode';
import { getVectorFillRotation } from 'utils/canvas/drawVectorNode/getVectorFillRotation';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { getVectorStrokeFillShape } from 'utils/canvas/vector/stroke/getVectorStrokeFillShape';
import { getVisibleSolidStrokePaints } from 'utils/canvas/vector/stroke/getVisibleSolidStrokePaints';
import { getVisibleStrokePaints } from 'utils/canvas/vector/stroke/getVisibleStrokePaints';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';
import { withPaintsOpacity } from 'utils/design/paint/withPaintsOpacity';

export const drawVectorNode = (context: TDrawSceneContext, node: TVectorNode, opacity = 1): void => {
  const { faceBufferCache } = context.imageContext;
  const renderedNode = getDrawnVectorNode(node);
  const nodeBounds = getVectorNodeBounds(renderedNode);
  const strokeShapes = getVectorStrokeFillShape(renderedNode);
  const fillRotation = getVectorFillRotation(node);

  groupFilledFacesForRendering(renderedNode).forEach(({ paint, polygons }) => {
    drawVectorFillGroup(context, faceBufferCache, nodeBounds, polygons, withPaintsOpacity(paint, opacity), [], fillRotation);
  });

  if (strokeShapes) {
    const strokePaints = withPaintsOpacity(getVisibleStrokePaints(renderedNode.strokes), opacity);

    strokeShapes.forEach(({ fillRule, polygons }) => {
      drawVectorFillGroup(context, null, nodeBounds, polygons, strokePaints, [], fillRotation, fillRule);
    });
  } else {
    getVisibleSolidStrokePaints(renderedNode.strokes).forEach((paint) => drawVectorSolidStroke(context, renderedNode, paint, opacity));
  }
};
