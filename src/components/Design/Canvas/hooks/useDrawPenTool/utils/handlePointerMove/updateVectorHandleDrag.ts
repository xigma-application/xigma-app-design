import { RefObject } from 'react';

// others
import { MIN_DRAG_DISTANCE_PX } from '../../../../constants';

// store
import { updateNode } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';

export const updateVectorHandleDrag = (
  point: TPoint,
  dragOrigin: TPenDragOrigin,
  dragStart: TPoint,
  viewport: TViewport,
  dispatch: AppDispatch,
  appStore: AppStore,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  penDraggedHandlePositionRef: RefObject<TPoint | null>,
): void => {
  const dx = point.x - dragStart.x;
  const dy = point.y - dragStart.y;

  if (Math.hypot(dx, dy) >= MIN_DRAG_DISTANCE_PX / viewport.zoom) {
    const node = getVectorEditingNode(appStore.getState().design.nodes, dragOrigin.nodeId);

    if (node) {
      const vertexHandleModes = { ...node.vertexHandleModes, [dragOrigin.vertexId]: 'smooth' as const };
      const segments = dragOrigin.segmentId
        ? { ...node.segments, [dragOrigin.segmentId]: { ...node.segments[dragOrigin.segmentId], tangentEnd: { x: -dx, y: -dy } } }
        : node.segments;

      dispatch(updateNode({ changes: { segments, vertexHandleModes }, id: dragOrigin.nodeId }));
      pendingOutgoingTangentRef.current = { tangent: { x: dx, y: dy }, vertexId: dragOrigin.vertexId };
      penDraggedHandlePositionRef.current = point;
    }
  }
};
