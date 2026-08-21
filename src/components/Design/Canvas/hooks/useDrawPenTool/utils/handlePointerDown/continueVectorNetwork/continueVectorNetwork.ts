import { nanoid } from '@reduxjs/toolkit';
import { RefObject } from 'react';

// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { AppDispatch, AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorTangent, TViewport } from 'types/design/types';

// utils
import { applyVectorPointSnapping } from '../../../../../utils/applyVectorPointSnapping';
import { closeLoopOntoEdge } from './closeLoopOntoEdge';
import { closeLoopOntoVertex } from './closeLoopOntoVertex';
import { extendWithNewVertex } from './extendWithNewVertex';
import { getVectorEdgeAtPoint } from '../../../../../utils/getVectorEdgeAtPoint';
import { getVectorVertexAtPoint } from '../../../../../utils/getVectorVertexAtPoint';
import { isPointNearVertex } from '../../../../../utils/isPointNearVertex';
import { roundVectorPoint } from 'utils/canvas/vectorNetwork/roundVectorPoint';

const getTangentStart = (pending: TPendingOutgoingTangent | null, activeVertexId: string): TVectorTangent =>
  pending && pending.vertexId === activeVertexId ? pending.tangent : null;

const getIncomingSegmentId = (node: TVectorNode, vertexId: string): string | null =>
  Object.values(node.segments).find((segment) => segment.endId === vertexId)?.id ?? null;

const getEdgeHit = (point: TPoint, node: TVectorNode, viewport: TViewport): { segmentId: string; t: number } | null =>
  getVectorEdgeAtPoint(point, node, VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

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
    const segmentId = isCtrlPressed ? getIncomingSegmentId(node, activeVertexId) : null;

    dragOriginRef.current = { nodeId: node.id, segmentId, vertexId: activeVertexId };
    dragStartRef.current = point;
  } else {
    const hover = getVectorVertexAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom, activeVertexId);
    const edgeHit = hover ? null : getEdgeHit(point, node, viewport);
    const tangentStart = getTangentStart(pendingOutgoingTangentRef.current, activeVertexId);
    const segmentId = nanoid();

    if (hover) {
      closeLoopOntoVertex(
        point,
        node,
        activeVertexId,
        hover.vertexId,
        segmentId,
        tangentStart,
        dispatch,
        dragOriginRef,
        dragStartRef,
        pendingOutgoingTangentRef,
      );
    } else if (edgeHit) {
      closeLoopOntoEdge(
        point,
        node,
        activeVertexId,
        edgeHit.segmentId,
        edgeHit.t,
        segmentId,
        tangentStart,
        dispatch,
        dragOriginRef,
        dragStartRef,
        pendingOutgoingTangentRef,
      );
    } else {
      const { point: snapped } = applyVectorPointSnapping(
        node.vertices[activeVertexId],
        point,
        viewport.zoom,
        isShiftPressed,
        appStore.getState().design.nodes,
      );
      const snappedPoint = roundVectorPoint(snapped);

      extendWithNewVertex(
        snappedPoint,
        node,
        activeVertexId,
        segmentId,
        tangentStart,
        dispatch,
        dragOriginRef,
        dragStartRef,
        pendingOutgoingTangentRef,
      );
    }

    vectorAlignmentGuideRef.current = null;
  }
};
