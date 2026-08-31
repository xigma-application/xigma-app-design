import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { DEFAULT_CURSOR } from 'utils/canvas/defaultCursor';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getSliceResizeHandleAtPoint } from '../getSliceResizeHandleAtPoint';
import { getSliceRotateHandleAtPoint } from '../getSliceRotateHandleAtPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const updateHoverCursor = (canvas: HTMLCanvasElement, event: PointerEvent, sliceRef: RefObject<TSliceDraft | null>): void => {
  const slice = sliceRef.current;

  if (slice && event.buttons === 0) {
    const viewport = selectViewport(store.getState());
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const resizeHandle = getSliceResizeHandleAtPoint(point, slice, viewport);
    const rotateHit = getSliceRotateHandleAtPoint(point, slice, viewport);

    switch (true) {
      case Boolean(resizeHandle):
        canvas.style.cursor = getRotatedCursorUrl('resize', getResizeCursorAngle(resizeHandle!, slice.rotation)) ?? '';
        break;
      case rotateHit:
        canvas.style.cursor = getRotatedCursorUrl('rotate', getRotateCursorAngle(point, slice, slice.rotation)) ?? '';
        break;
      default:
        canvas.style.cursor = DEFAULT_CURSOR;
        break;
    }
  }
};
