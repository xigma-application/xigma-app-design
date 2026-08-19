import { RefObject } from 'react';

// store
import { AppDispatch, AppStore } from 'store';

// types
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { continueVectorNetwork } from './continueVectorNetwork/continueVectorNetwork';
import { startNewVectorNetwork } from './startNewVectorNetwork';
import { startVectorFragment } from './startVectorFragment';

export const startOrContinueVectorNetwork = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  point: TPoint,
  node: TVectorNode | null,
  penActiveVertexId: string | null,
  viewport: TViewport,
  dispatch: AppDispatch,
  appStore: AppStore,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
): void => {
  if (!node) {
    startNewVectorNetwork(point, dispatch, appStore, dragOriginRef, dragStartRef);
  } else if (!penActiveVertexId) {
    startVectorFragment(point, node, viewport, dispatch, dragOriginRef, dragStartRef);
  } else {
    continueVectorNetwork(point, node, penActiveVertexId, viewport, dispatch, dragOriginRef, dragStartRef, pendingOutgoingTangentRef);
  }

  canvas.setPointerCapture(event.pointerId);
};
