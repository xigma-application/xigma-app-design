import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorEraseDragState } from 'types/design/selectionTool/types';

// utils
import { getAxisLockedPoint } from 'utils/math/axis/getAxisLockedPoint';
import { getDominantAxis } from 'utils/math/axis/getDominantAxis';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueVectorEraseDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorEraseDragRef: RefObject<TVectorEraseDragState | null>,
  vectorEraseStrokeRef: RefObject<TPoint[] | null>,
): void => {
  const dragState = vectorEraseDragRef.current;
  const strokePath = vectorEraseStrokeRef.current;

  if (dragState && strokePath) {
    const viewport = selectViewport(store.getState());
    const currentPoint = screenToWorld(getPointerPosition(canvas, event), viewport);

    if (!event.shiftKey) {
      dragState.axisLock = null;
      dragState.shiftAnchor = null;
      strokePath.push(currentPoint);
      dragState.lastPoint = currentPoint;

      return;
    }

    const anchor = dragState.shiftAnchor ?? dragState.lastPoint;
    const axis = dragState.axisLock ?? getDominantAxis(anchor, currentPoint, viewport.zoom);

    dragState.shiftAnchor = anchor;
    dragState.axisLock = axis;

    const point = axis ? getAxisLockedPoint(anchor, currentPoint, axis) : currentPoint;

    strokePath.push(point);
    dragState.lastPoint = point;
  }
};
