import { RefObject } from 'react';

// store
import { beginHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { setSelection } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  lastPointerClientPositionRef: RefObject<TPoint | null>,
): void => {
  lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };

  if (event.button === MouseButton.primary) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs)));
    dispatch(setSelection([]));
    startRef.current = screenToWorld(getPointerPosition(canvas, event), viewport);
    canvas.setPointerCapture(event.pointerId);
  }
};
