import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TSliceDrawDragState, TSliceMoveDragState, TSliceResizeDragState, TSliceRotateDragState } from '../../types';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { armDrawDrag } from './armDrawDrag';
import { armMoveDrag } from './armMoveDrag';
import { armResizeDrag } from './armResizeDrag';
import { armRotateDrag } from './armRotateDrag';
import { discardSlice } from './discardSlice';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getRotatedBoundingBox } from 'utils/canvas/getRotatedBoundingBox';
import { getSliceResizeHandleAtPoint } from '../getSliceResizeHandleAtPoint';
import { getSliceRotateHandleAtPoint } from '../getSliceRotateHandleAtPoint';
import { isPointInRect } from '../../../../utils/isPointInRect';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  sliceRef: RefObject<TSliceDraft | null>,
  drawDragRef: RefObject<TSliceDrawDragState | null>,
  resizeDragRef: RefObject<TSliceResizeDragState | null>,
  rotateDragRef: RefObject<TSliceRotateDragState | null>,
  moveDragRef: RefObject<TSliceMoveDragState | null>,
): void => {
  if (event.button === MouseButton.primary) {
    const viewport = selectViewport(store.getState());
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const slice = sliceRef.current;
    const resizeHandleHit = slice ? getSliceResizeHandleAtPoint(point, slice, viewport) : null;
    const rotateHandleHit = slice ? getSliceRotateHandleAtPoint(point, slice, viewport) : false;

    switch (true) {
      case !slice:
        dispatch(setSelection([]));
        armDrawDrag(canvas, event, drawDragRef, point);
        break;
      case Boolean(resizeHandleHit):
        armResizeDrag(canvas, event, resizeDragRef, slice!, resizeHandleHit!);
        break;
      case rotateHandleHit:
        armRotateDrag(canvas, event, rotateDragRef, slice!, point);
        break;
      case isPointInRect(point, getRotatedBoundingBox(slice!, slice!.rotation)):
        armMoveDrag(canvas, event, moveDragRef, slice!, point);
        break;
      default:
        discardSlice(dispatch, sliceRef);
        break;
    }
  }
};
