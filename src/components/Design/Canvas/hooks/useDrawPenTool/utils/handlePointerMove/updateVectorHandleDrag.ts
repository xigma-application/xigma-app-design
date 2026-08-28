import { RefObject } from 'react';

// others
import { MIN_DRAG_DISTANCE_PX } from '../../../../constants';

// store
import { updateNode } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

// types
import { TVectorEditRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { applyVectorPointSnapping } from '../../../../utils/applyVectorPointSnapping';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';

export const updateVectorHandleDrag = (
  point: TPoint,
  dragOrigin: TPenDragOrigin,
  dragStart: TPoint,
  viewport: TViewport,
  isShiftPressed: boolean,
  dispatch: AppDispatch,
  appStore: AppStore,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  penDraggedHandlePositionRef: RefObject<TPoint | null>,
  penDraggedHandleIsSnappedRef: RefObject<boolean>,
  vectorAlignmentGuideRef: TVectorEditRefs['vectorAlignmentGuideRef'],
): void => {
  if (Math.hypot(point.x - dragStart.x, point.y - dragStart.y) >= MIN_DRAG_DISTANCE_PX / viewport.zoom) {
    const nodes = appStore.getState().design.pages[appStore.getState().design.activePageId].nodes;
    const node = getVectorEditingNode(nodes, dragOrigin.nodeId);

    if (node) {
      const {
        guide,
        isAngleSnapped,
        point: snappedPoint,
      } = applyVectorPointSnapping(dragStart, point, viewport.zoom, isShiftPressed, nodes);
      const dx = snappedPoint.x - dragStart.x;
      const dy = snappedPoint.y - dragStart.y;
      const vertexHandleModes = { ...node.vertexHandleModes, [dragOrigin.vertexId]: 'symmetric' as const };
      const segments = dragOrigin.segmentId
        ? {
            ...node.segments,
            [dragOrigin.segmentId]: { ...node.segments[dragOrigin.segmentId], tangentEnd: { x: -dx || 0, y: -dy || 0 } },
          }
        : node.segments;

      dispatch(updateNode({ changes: { segments, vertexHandleModes }, id: dragOrigin.nodeId }));
      pendingOutgoingTangentRef.current = { tangent: { x: dx, y: dy }, vertexId: dragOrigin.vertexId };
      penDraggedHandlePositionRef.current = snappedPoint;
      penDraggedHandleIsSnappedRef.current = isAngleSnapped;
      vectorAlignmentGuideRef.current = guide;
    }
  }
};
