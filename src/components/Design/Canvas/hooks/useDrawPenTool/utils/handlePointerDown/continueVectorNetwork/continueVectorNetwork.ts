import { nanoid } from '@reduxjs/toolkit';
import { RefObject } from 'react';

// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { AppDispatch } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorTangent, TViewport } from 'types/design/types';

// utils
import { closeLoopOntoEdge } from './closeLoopOntoEdge';
import { closeLoopOntoVertex } from './closeLoopOntoVertex';
import { extendWithNewVertex } from './extendWithNewVertex';
import { getVectorEdgeAtPoint } from '../../../../../utils/getVectorEdgeAtPoint';
import { getVectorVertexAtPoint } from '../../../../../utils/getVectorVertexAtPoint';

const getTangentStart = (pending: TPendingOutgoingTangent | null, activeVertexId: string): TVectorTangent =>
  pending && pending.vertexId === activeVertexId ? pending.tangent : null;

const getEdgeHit = (point: TPoint, node: TVectorNode, viewport: TViewport): { segmentId: string; t: number } | null =>
  getVectorEdgeAtPoint(point, node, VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

export const continueVectorNetwork = (
  point: TPoint,
  node: TVectorNode,
  activeVertexId: string,
  viewport: TViewport,
  dispatch: AppDispatch,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  const hover = getVectorVertexAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom, activeVertexId);
  const edgeHit = hover ? null : getEdgeHit(point, node, viewport);
  const tangentStart = getTangentStart(pendingOutgoingTangentRef.current, activeVertexId);
  const segmentId = nanoid();

  if (hover) {
    closeLoopOntoVertex(node, activeVertexId, hover.vertexId, segmentId, tangentStart, dispatch, pendingOutgoingTangentRef);
  } else if (edgeHit) {
    closeLoopOntoEdge(node, activeVertexId, edgeHit.segmentId, edgeHit.t, segmentId, tangentStart, dispatch, pendingOutgoingTangentRef);
  } else {
    extendWithNewVertex(
      point,
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
};
