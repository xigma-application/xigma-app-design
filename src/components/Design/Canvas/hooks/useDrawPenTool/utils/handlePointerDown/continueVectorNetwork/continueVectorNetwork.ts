import { RefObject } from 'react';

// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { AppDispatch, AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { applyContinueVectorNetworkHit } from './applyContinueVectorNetworkHit';
import { isPointNearVertex } from '../../../../../utils/isPointNearVertex';
import { resolveContinueVectorNetworkHit } from './resolveContinueVectorNetworkHit/resolveContinueVectorNetworkHit';

const getIncomingSegmentId = (node: TVectorNode, vertexId: string): string | null =>
  Object.values(node.segments).find((segment) => segment.endId === vertexId)?.id ?? null;

const armVertexDragOrigin = (
  node: TVectorNode,
  activeVertexId: string,
  point: TPoint,
  isCtrlPressed: boolean,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
): void => {
  const segmentId = isCtrlPressed ? getIncomingSegmentId(node, activeVertexId) : null;

  dragOriginRef.current = { nodeId: node.id, segmentId, vertexId: activeVertexId };
  dragStartRef.current = point;
};

export const continueVectorNetwork = (
  point: TPoint,
  node: TVectorNode,
  activeVertexId: string,
  viewport: TViewport,
  dispatch: AppDispatch,
  appStore: AppStore,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
  isCtrlPressed: boolean,
  isShiftPressed: boolean,
): void => {
  if (isPointNearVertex(point, node.vertices[activeVertexId], VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom)) {
    armVertexDragOrigin(node, activeVertexId, point, isCtrlPressed, dragOriginRef, dragStartRef);
  } else {
    const hit = resolveContinueVectorNetworkHit(point, node, activeVertexId, viewport, appStore);

    applyContinueVectorNetworkHit(
      hit,
      point,
      node,
      activeVertexId,
      viewport,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      isShiftPressed,
    );
    vectorAlignmentGuideRef.current = null;
  }
};
