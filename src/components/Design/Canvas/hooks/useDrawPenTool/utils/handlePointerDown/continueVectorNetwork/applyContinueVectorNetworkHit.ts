import { nanoid } from '@reduxjs/toolkit';
import { RefObject } from 'react';

// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorTangent, TViewport } from 'types/design/types';
import { TContinueVectorNetworkHit } from './types';

// utils
import { applyVectorPointSnapping } from '../../../../../utils/applyVectorPointSnapping';
import { closeLoopOntoAnotherNode } from './closeLoopOntoAnotherNode';
import { closeLoopOntoAnotherNodeEdge } from './closeLoopOntoAnotherNodeEdge';
import { closeLoopOntoEdge } from './closeLoopOntoEdge';
import { closeLoopOntoVertex } from './closeLoopOntoVertex';
import { extendWithNewVertex } from './extendWithNewVertex';
import { roundVectorPoint } from 'utils/canvas/vectorNetwork/roundVectorPoint';

const getTangentStart = (pending: TPendingOutgoingTangent | null, activeVertexId: string): TVectorTangent =>
  pending && pending.vertexId === activeVertexId ? pending.tangent : null;

export const applyContinueVectorNetworkHit = (
  hit: TContinueVectorNetworkHit,
  point: TPoint,
  node: TVectorNode,
  activeVertexId: string,
  viewport: TViewport,
  dispatch: AppDispatch,
  appStore: AppStore,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  isShiftPressed: boolean,
): void => {
  const segmentId = nanoid();
  const tangentStart = getTangentStart(pendingOutgoingTangentRef.current, activeVertexId);

  switch (hit.kind) {
    case 'vertex': {
      closeLoopOntoVertex(
        point,
        node,
        activeVertexId,
        hit.vertexId,
        segmentId,
        tangentStart,
        dispatch,
        dragOriginRef,
        dragStartRef,
        pendingOutgoingTangentRef,
      );
      break;
    }
    case 'crossNodeVertex': {
      closeLoopOntoAnotherNode(
        point,
        node,
        hit.targetNode,
        activeVertexId,
        hit.vertexId,
        segmentId,
        tangentStart,
        selectVectorEditingNodeIds(appStore.getState()),
        dispatch,
        dragOriginRef,
        dragStartRef,
        pendingOutgoingTangentRef,
      );
      break;
    }
    case 'edge': {
      closeLoopOntoEdge(
        point,
        node,
        activeVertexId,
        hit.segmentId,
        hit.t,
        segmentId,
        tangentStart,
        dispatch,
        dragOriginRef,
        dragStartRef,
        pendingOutgoingTangentRef,
      );
      break;
    }
    case 'crossNodeEdge': {
      closeLoopOntoAnotherNodeEdge(
        point,
        node,
        hit.targetNode,
        activeVertexId,
        hit.segmentId,
        hit.t,
        segmentId,
        tangentStart,
        selectVectorEditingNodeIds(appStore.getState()),
        dispatch,
        dragOriginRef,
        dragStartRef,
        pendingOutgoingTangentRef,
      );
      break;
    }
    case 'extend': {
      const { point: snapped } = applyVectorPointSnapping(
        node.vertices[activeVertexId],
        point,
        viewport.zoom,
        isShiftPressed,
        appStore.getState().design.pages[appStore.getState().design.activePageId].nodes,
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
      break;
    }
    // no default
  }
};
