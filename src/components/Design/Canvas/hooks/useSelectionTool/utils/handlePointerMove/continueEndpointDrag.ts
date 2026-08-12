import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TEndpointDragState } from '../../types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueEndpointDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  endpointDragRef: RefObject<TEndpointDragState | null>,
): void => {
  const endpointDragState = endpointDragRef.current;

  if (endpointDragState) {
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const { endpoint, nodeId } = endpointDragState;

    dispatch(updateNode({ changes: endpoint === 'a' ? { x1: point.x, y1: point.y } : { x2: point.x, y2: point.y }, id: nodeId }));
  }
};
