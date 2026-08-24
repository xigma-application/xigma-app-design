import { RefObject } from 'react';

// others
import { PENCIL_SIMPLIFY_TOLERANCE_PX } from '../../../../constants';

// store
import { endHistoryGesture } from 'store/history/actions';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPencilAxis } from '../handlePointerMove/getAxisLockedPoint';
import { TPoint } from 'types/canvas';

// utils
import { commitPencilNodeIfLongEnough } from './commitPencilNodeIfLongEnough';
import { commitPencilTail } from '../commitPencilTail';
import { foldPendingAxisLock } from './foldPendingAxisLock';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  refs: TCanvasRefs,
  committedPointsRef: RefObject<TPoint[] | null>,
  tailPointsRef: RefObject<TPoint[] | null>,
  axisLockRef: RefObject<TPencilAxis | null>,
  shiftAnchorRef: RefObject<TPoint | null>,
  rawPointsRef: RefObject<TPoint[] | null>,
): void => {
  const committed = committedPointsRef.current;
  const tail = tailPointsRef.current;

  if (committed && tail) {
    const viewport = selectViewport(appStore.getState());

    foldPendingAxisLock(canvas, event, viewport, tail, axisLockRef, shiftAnchorRef);

    const finalPoints = commitPencilTail(tail, committed, PENCIL_SIMPLIFY_TOLERANCE_PX / viewport.zoom);

    commitPencilNodeIfLongEnough(dispatch, appStore, finalPoints);
    dispatch(endHistoryGesture());
    committedPointsRef.current = null;
    tailPointsRef.current = null;
    axisLockRef.current = null;
    shiftAnchorRef.current = null;
    rawPointsRef.current = null;
    refs.pencilPreviewPointsRef.current = null;
    refs.pencilRawPreviewPointsRef.current = null;
    refs.pencilShowRawPreviewRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
  }
};
