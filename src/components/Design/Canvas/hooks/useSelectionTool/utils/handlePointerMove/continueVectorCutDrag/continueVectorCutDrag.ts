import { RefObject } from 'react';

// others
import { MIN_DRAG_DISTANCE_PX } from '../../../../../constants';

// store
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorCutDragState } from 'types/design/selectionTool/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { findLineNetworkCrossings } from 'utils/canvas/vectorNetwork/cutVectorNetwork/findLineNetworkCrossings';
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { screenToWorld } from '../../../../../utils/screenToWorld';

export const continueVectorCutDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  vectorCutDragRef: RefObject<TVectorCutDragState | null>,
): void => {
  const dragState = vectorCutDragRef.current;

  if (dragState) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const dx = point.x - dragState.lineStart.x;
    const dy = point.y - dragState.lineStart.y;
    const hasCrossedThreshold = Math.hypot(dx, dy) >= MIN_DRAG_DISTANCE_PX / viewport.zoom;

    if (hasCrossedThreshold) {
      if (dragState.status === 'pending') {
        vectorCutDragRef.current = { lineStart: dragState.lineStart, status: 'dividing' };
      }

      const crossings = selectVectorEditingNodeIds(state).flatMap((nodeId) => {
        const node = getVectorEditingNode(state.design.nodes, nodeId);
        const bakedNode = node && { ...node, ...bakeVectorNodeRotation(node) };

        return bakedNode
          ? findLineNetworkCrossings(dragState.lineStart, point, bakedNode.segments, bakedNode.vertices).map((crossing) => ({
              ...crossing,
              nodeId,
            }))
          : [];
      });

      canvasRefs.vectorCutPreviewRef.current = { crossings, lineEnd: point, lineStart: dragState.lineStart };
    }
  }
};
