import { RefObject } from 'react';

// store
import { beginHistoryGesture } from 'store/history/actions';
import { selectPenActiveVertexId, selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { bakeEditingNodeRotation } from './bakeEditingNodeRotation';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
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
): void => {
  if (event.button === MouseButton.primary) {
    const state = appStore.getState();
    const viewport = selectViewport(state);
    const vectorEditingNodeId = selectVectorEditingNodeId(state);
    const penActiveVertexId = selectPenActiveVertexId(state);
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const point: TPoint = { x: Math.round(rawPoint.x), y: Math.round(rawPoint.y) };
    const editingNode = getVectorEditingNode(state.design.nodes, vectorEditingNodeId);

    dispatch(beginHistoryGesture());
    bakeEditingNodeRotation(dispatch, editingNode);
    startOrContinueVectorNetwork(
      canvas,
      event,
      point,
      getVectorEditingNode(appStore.getState().design.nodes, vectorEditingNodeId),
      penActiveVertexId,
      viewport,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
    );
  }
};
