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
import { getEligibleVectorAtPoint } from '../getEligibleVectorAtPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  attachTargetIdRef: RefObject<string | null>,
): void => {
  if (event.button === MouseButton.primary) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    dispatch(setSelection([]));
    startRef.current = screenToWorld(getPointerPosition(canvas, event), viewport);
    attachTargetIdRef.current = getEligibleVectorAtPoint(startRef.current, viewport)?.id ?? null;
    canvas.setPointerCapture(event.pointerId);
  }
};
