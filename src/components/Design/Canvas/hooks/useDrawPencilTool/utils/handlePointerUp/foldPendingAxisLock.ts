// types
import { TPencilDragRefs } from '../../types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getAxisLockedPoint } from 'utils/math/axis/getAxisLockedPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const foldPendingAxisLock = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: TViewport,
  tail: TPoint[],
  pencilDragRefs: TPencilDragRefs,
): void => {
  const { axisLockRef, shiftAnchorRef } = pencilDragRefs;

  if (axisLockRef.current && shiftAnchorRef.current) {
    const currentPoint = screenToWorld(getPointerPosition(canvas, event), viewport);

    tail.push(getAxisLockedPoint(shiftAnchorRef.current, currentPoint, axisLockRef.current));
  }
};
