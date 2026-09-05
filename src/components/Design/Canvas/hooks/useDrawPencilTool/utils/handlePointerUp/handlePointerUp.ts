// others
import { PENCIL_SIMPLIFY_TOLERANCE_PX } from '../../../../constants';

// store
import { endHistoryGesture } from 'store/history/actions';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPencilDragRefs } from '../../types';

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
  pencilDragRefs: TPencilDragRefs,
): void => {
  const { axisLockRef, committedPointsRef, rawPointsRef, shiftAnchorRef, tailPointsRef } = pencilDragRefs;
  const committed = committedPointsRef.current;
  const tail = tailPointsRef.current;

  if (committed && tail) {
    const viewport = selectViewport(appStore.getState());
    foldPendingAxisLock(canvas, event, viewport, tail, pencilDragRefs);
    const finalPoints = commitPencilTail(tail, committed, PENCIL_SIMPLIFY_TOLERANCE_PX / viewport.zoom);

    commitPencilNodeIfLongEnough(dispatch, appStore, finalPoints);
    dispatch(endHistoryGesture());
    committedPointsRef.current = null;
    tailPointsRef.current = null;
    axisLockRef.current = null;
    shiftAnchorRef.current = null;
    rawPointsRef.current = null;
    refs.pencil.pencilPreviewPointsRef.current = null;
    refs.pencil.pencilRawPreviewPointsRef.current = null;
    refs.pencil.pencilShowRawPreviewRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
  }
};
