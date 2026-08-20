import { RefObject } from 'react';

// store
import { selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorPointsInRect } from 'utils/canvas/vectorNetwork/getVectorPointsInRect';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { toDraftRect } from '../../../../utils/toDraftRect';

export const continueVectorMarqueeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  vectorMarqueeStartRef: RefObject<TPoint | null>,
): void => {
  if (vectorMarqueeStartRef.current) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

    if (node) {
      const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
      const rect = toDraftRect(vectorMarqueeStartRef.current, point);
      const { handles, vertexIds } = getVectorPointsInRect(node, rect);

      canvasRefs.marqueeRef.current = rect;
      canvasRefs.selectedVectorVertexIdsRef.current = vertexIds;
      canvasRefs.selectedVectorHandlesRef.current = handles;
    }
  }
};
