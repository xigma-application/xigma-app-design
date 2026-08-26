import { RefObject } from 'react';

// store
import { selectPenActiveVertexId, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs, TVectorHandleHover } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorMarqueeMode } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { applyVectorMarqueeSelection } from './applyVectorMarqueeSelection';
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorMarqueeHandleHitsForNode } from './getVectorMarqueeHandleHitsForNode';
import { getVectorPointsInRect } from 'utils/canvas/vectorNetwork/getVectorPointsInRect';
import { getVectorSegmentsInRect } from 'utils/canvas/vectorNetwork/getVectorSegmentsInRect';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';
import { resolveVectorMarqueeMode } from '../resolveVectorMarqueeMode';
import { screenToWorld } from '../../../../../utils/screenToWorld';
import { toDraftRect } from '../../../../../utils/toDraftRect';

export const continueVectorMarqueeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  vectorMarqueeStartRef: RefObject<TPoint | null>,
  vectorMarqueeModeRef: RefObject<TVectorMarqueeMode | null>,
): void => {
  if (vectorMarqueeStartRef.current) {
    const state = store.getState();
    const openNodes = selectVectorEditingNodeIds(state)
      .map((id) => getVectorEditingNode(state.design.nodes, id))
      .filter((node): node is TVectorNode => node !== null);

    if (openNodes.length > 0) {
      const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
      const rect = toDraftRect(vectorMarqueeStartRef.current, point);
      const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(
        canvasRefs.preVectorMarqueeVertexIdsRef.current,
        selectPenActiveVertexId(state),
      );
      const vertexIds = openNodes.flatMap((node) => getVectorPointsInRect(node, rect));
      const segmentHits = openNodes.flatMap((node) => getVectorSegmentsInRect(node, rect));
      const handleHits: TVectorHandleHover[] = openNodes.flatMap((node) =>
        getVectorMarqueeHandleHitsForNode(node, rect, visualSelectedVertexIds, canvasRefs),
      );

      canvasRefs.marqueeRef.current = rect;
      vectorMarqueeModeRef.current = resolveVectorMarqueeMode(vectorMarqueeModeRef.current, vertexIds, handleHits, segmentHits);

      applyVectorMarqueeSelection(canvasRefs, vectorMarqueeModeRef.current, vertexIds, handleHits, segmentHits);
    }
  }
};
