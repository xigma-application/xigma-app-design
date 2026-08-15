import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TSliceDraft, TSliceRotateDragState } from '../../types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  sliceRef: RefObject<TSliceDraft | null>,
  rotateDragRef: RefObject<TSliceRotateDragState | null>,
): void => {
  if (rotateDragRef.current) {
    const { cursorAngle, origin, pivot, startAngle } = rotateDragRef.current;
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const deltaDegrees = getAngleBetweenPoints(pivot, point) - startAngle;
    const originCenter = { x: origin.x + origin.width / 2, y: origin.y + origin.height / 2 };
    const newCenter = rotatePoint(originCenter, pivot, deltaDegrees);

    canvas.style.cursor = getRotatedRotateCursorUrl(cursorAngle + deltaDegrees) ?? canvas.style.cursor;

    sliceRef.current = {
      height: origin.height,
      rotation: Math.round((origin.rotation + deltaDegrees) * 100) / 100,
      width: origin.width,
      x: newCenter.x - origin.width / 2,
      y: newCenter.y - origin.height / 2,
    };
  }
};
