import { RefObject } from 'react';

// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { beginHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectPenActiveVertexId, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { bakeEditingNodeRotation } from './bakeEditingNodeRotation';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { resolvePenTargetNode } from '../resolvePenTargetNode';
import { roundVectorPoint } from 'utils/canvas/vectorNetwork/roundVectorPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { startOrContinueVectorNetwork } from './startOrContinueVectorNetwork';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
  canvasRefs: TCanvasRefs,
): void => {
  if (event.button === MouseButton.primary) {
    const state = appStore.getState();
    const viewport = selectViewport(state);
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const penActiveVertexId = selectPenActiveVertexId(state);
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const point: TPoint = roundVectorPoint(rawPoint);

    const editingNode = resolvePenTargetNode(
      point,
      vectorEditingNodeIds,
      state.design.nodes,
      penActiveVertexId,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
      viewport.zoom,
    );

    const node = resolvePenTargetNode(
      point,
      vectorEditingNodeIds,
      appStore.getState().design.nodes,
      penActiveVertexId,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
      viewport.zoom,
    );

    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs)));
    bakeEditingNodeRotation(dispatch, editingNode);
    startOrContinueVectorNetwork(
      canvas,
      event,
      point,
      node,
      penActiveVertexId,
      viewport,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      vectorAlignmentGuideRef,
    );
  }
};
