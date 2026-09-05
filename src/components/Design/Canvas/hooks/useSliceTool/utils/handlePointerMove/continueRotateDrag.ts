import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TSliceRotateDragState } from '../../types';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from 'utils/transform/screenToWorld';

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

    canvas.style.cursor = getRotatedCursorUrl('rotate', cursorAngle + deltaDegrees) ?? canvas.style.cursor;

    sliceRef.current = {
      height: origin.height,
      rotation: Math.round((origin.rotation + deltaDegrees) * 100) / 100,
      width: origin.width,
      x: newCenter.x - origin.width / 2,
      y: newCenter.y - origin.height / 2,
    };
  }
};
