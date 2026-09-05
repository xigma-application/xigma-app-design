// others
import { HOVER_OUTLINE_WIDTH, VECTOR_CUT_LINE_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawVectorCutPointMarker } from './drawVectorCutPointMarker';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';

export const drawVectorCutHoverPreview = (context: TDrawSceneContext, nodes: Record<string, TSceneNode>, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const hoveredSegment = refs.hover.hoveredVectorCutSegmentRef.current;
  const hoveredPoint = refs.hover.hoveredVectorCutPointRef.current;
  const node = hoveredSegment ? getVectorEditingNode(nodes, hoveredSegment.nodeId) : null;

  if (node && hoveredSegment) {
    const bakedNode = getRenderedVectorNode(node);
    const segment = flattenVectorSegments(bakedNode).find((candidate) => candidate.segmentId === hoveredSegment.segmentId);

    if (segment) {
      drawVectorStroke(
        gl,
        program,
        buffer,
        [segment],
        VECTOR_CUT_LINE_STROKE,
        HOVER_OUTLINE_WIDTH / viewport.zoom,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    }
  }

  if (hoveredPoint) {
    drawVectorCutPointMarker(gl, program, buffer, hoveredPoint, canvasWidth, canvasHeight, viewport);
  }
};
