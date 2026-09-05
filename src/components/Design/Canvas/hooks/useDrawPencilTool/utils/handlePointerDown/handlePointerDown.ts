// store
import { setSelection } from 'store/design/slice';
import { beginHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPencilDragRefs } from '../../types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  refs: TCanvasRefs,
  pencilDragRefs: TPencilDragRefs,
): void => {
  if (event.button === MouseButton.primary) {
    const viewport = selectViewport(appStore.getState());
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);

    dispatch(setSelection([]));
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));

    pencilDragRefs.committedPointsRef.current = [point];
    pencilDragRefs.tailPointsRef.current = [point];
    pencilDragRefs.axisLockRef.current = null;
    pencilDragRefs.shiftAnchorRef.current = null;
    pencilDragRefs.rawPointsRef.current = [point];
    refs.pencil.pencilPreviewPointsRef.current = [point];
    refs.pencil.pencilRawPreviewPointsRef.current = null;
    refs.pencil.pencilShowRawPreviewRef.current = false;
    canvas.setPointerCapture(event.pointerId);
  }
};
