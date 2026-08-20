import { RefObject } from 'react';

// store
import { selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorMarqueeMode } from 'types/design/selectionTool/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorHandlesInRect } from 'utils/canvas/vectorNetwork/getVectorHandlesInRect';
import { getVectorPointsInRect } from 'utils/canvas/vectorNetwork/getVectorPointsInRect';
import { getVectorSegmentsInRect } from 'utils/canvas/vectorNetwork/getVectorSegmentsInRect';
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
      const handleHits = getVectorHandlesInRect(node, rect);
      const segmentHits = getVectorSegmentsInRect(node, rect);

      canvasRefs.marqueeRef.current = rect;
      vectorMarqueeModeRef.current = resolveVectorMarqueeMode(vectorMarqueeModeRef.current, vertexIds, handleHits, segmentHits);

      switch (vectorMarqueeModeRef.current) {
        case 'points':
          canvasRefs.selectedVectorVertexIdsRef.current = vertexIds;
          canvasRefs.selectedVectorHandlesRef.current = [];
          canvasRefs.selectedVectorSegmentIdsRef.current = [];
          break;
        case 'everything':
          canvasRefs.selectedVectorVertexIdsRef.current = vertexIds;
          canvasRefs.selectedVectorHandlesRef.current = handleHits;
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
