import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { beginHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPencilAxis } from '../handlePointerMove/getAxisLockedPoint';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const handlePointerDown = (
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
  if (event.button === MouseButton.primary) {
    const viewport = selectViewport(appStore.getState());
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);

    dispatch(setSelection([]));
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));

    committedPointsRef.current = [point];
    tailPointsRef.current = [point];
    axisLockRef.current = null;
    shiftAnchorRef.current = null;
    rawPointsRef.current = [point];
    refs.pencilPreviewPointsRef.current = [point];
    refs.pencilRawPreviewPointsRef.current = null;
    refs.pencilShowRawPreviewRef.current = false;
    canvas.setPointerCapture(event.pointerId);
  }
};
