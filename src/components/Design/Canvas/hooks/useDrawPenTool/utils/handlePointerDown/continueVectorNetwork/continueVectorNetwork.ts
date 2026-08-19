import { nanoid } from '@reduxjs/toolkit';
import { RefObject } from 'react';

// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { AppDispatch } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorTangent, TViewport } from 'types/design/types';

// utils
import { closeLoopOntoVertex } from './closeLoopOntoVertex';
import { extendWithNewVertex } from './extendWithNewVertex';
import { getVectorVertexAtPoint } from '../../../../../utils/getVectorVertexAtPoint';

const getTangentStart = (pending: TPendingOutgoingTangent | null, activeVertexId: string): TVectorTangent =>
  pending && pending.vertexId === activeVertexId ? pending.tangent : null;

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
  const tangentStart = getTangentStart(pendingOutgoingTangentRef.current, activeVertexId);
  const segmentId = nanoid();

  if (hover) {
    closeLoopOntoVertex(node, activeVertexId, hover.vertexId, segmentId, tangentStart, dispatch, pendingOutgoingTangentRef);
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
