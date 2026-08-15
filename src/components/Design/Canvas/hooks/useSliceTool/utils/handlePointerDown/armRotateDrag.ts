import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';
import { TSliceDraft, TSliceRotateDragState } from '../../types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';

export const armRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  rotateDragRef: RefObject<TSliceRotateDragState | null>,
  origin: TSliceDraft,
  point: TPoint,
): void => {
  const pivot: TPoint = { x: origin.x + origin.width / 2, y: origin.y + origin.height / 2 };

  rotateDragRef.current = {
    cursorAngle: getRotateCursorAngle(point, origin, origin.rotation),
    origin,
    pivot,
    startAngle: getAngleBetweenPoints(pivot, point),
  };
  canvas.setPointerCapture(event.pointerId);
};
