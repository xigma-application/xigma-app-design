import { RefObject } from 'react';

// store
import { selectPenActiveVertexId, selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorMarqueeMode } from 'types/design/selectionTool/types';

// utils
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getTangentVisibilityVertexIds } from 'utils/canvas/vectorNetwork/getTangentVisibilityVertexIds';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorHandlesInRect } from 'utils/canvas/vectorNetwork/getVectorHandlesInRect';
import { getVectorPointsInRect } from 'utils/canvas/vectorNetwork/getVectorPointsInRect';
import { getVectorSegmentsInRect } from 'utils/canvas/vectorNetwork/getVectorSegmentsInRect';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';
import { resolveVectorMarqueeMode } from './resolveVectorMarqueeMode';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { toDraftRect } from '../../../../utils/toDraftRect';

export const continueVectorMarqueeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  vectorMarqueeStartRef: RefObject<TPoint | null>,
  vectorMarqueeModeRef: RefObject<TVectorMarqueeMode | null>,
): void => {
  if (vectorMarqueeStartRef.current) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

    if (node) {
      const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
      const rect = toDraftRect(vectorMarqueeStartRef.current, point);
      const vertexIds = getVectorPointsInRect(node, rect);
      const segmentHits = getVectorSegmentsInRect(node, rect);
      const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(
        canvasRefs.preVectorMarqueeVertexIdsRef.current,
        selectPenActiveVertexId(state),
      );
      const tangentVisibilityVertexIds = getTangentVisibilityVertexIds(
        node,
        visualSelectedVertexIds,
        canvasRefs.selectedVectorHandlesRef.current,
      );
      const oneHopVertexIds = getOneHopVectorVertexIds(node, tangentVisibilityVertexIds);
      const handleHits = getVectorHandlesInRect(
        node,
        rect,
        tangentVisibilityVertexIds,
        oneHopVertexIds,
        canvasRefs.preVectorMarqueeSegmentIdsRef.current,
        canvasRefs.selectedVectorHandlesRef.current,
      );

      canvasRefs.marqueeRef.current = rect;
      vectorMarqueeModeRef.current = resolveVectorMarqueeMode(vectorMarqueeModeRef.current, vertexIds, handleHits, segmentHits);

      switch (vectorMarqueeModeRef.current) {
        case 'handles':
          canvasRefs.selectedVectorVertexIdsRef.current = [];
          canvasRefs.selectedVectorHandlesRef.current = handleHits;
          canvasRefs.selectedVectorSegmentIdsRef.current = [];
          break;
        case 'points':
          canvasRefs.selectedVectorVertexIdsRef.current = vertexIds;
          canvasRefs.selectedVectorHandlesRef.current = [];
          canvasRefs.selectedVectorSegmentIdsRef.current = [];
          break;
        case 'everything':
          canvasRefs.selectedVectorVertexIdsRef.current = [];
          canvasRefs.selectedVectorHandlesRef.current = [];
          canvasRefs.selectedVectorSegmentIdsRef.current = segmentHits;
          break;
        default:
          canvasRefs.selectedVectorVertexIdsRef.current = [];
          canvasRefs.selectedVectorHandlesRef.current = [];
          canvasRefs.selectedVectorSegmentIdsRef.current = [];
      }
    }
  }
};
