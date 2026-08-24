import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getAxisLockedPoint, type TPencilAxis } from '../handlePointerMove/getAxisLockedPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const foldPendingAxisLock = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: TViewport,
  tail: TPoint[],
  axisLockRef: RefObject<TPencilAxis | null>,
  shiftAnchorRef: RefObject<TPoint | null>,
): void => {
  if (axisLockRef.current && shiftAnchorRef.current) {
    const currentPoint = screenToWorld(getPointerPosition(canvas, event), viewport);

    tail.push(getAxisLockedPoint(shiftAnchorRef.current, currentPoint, axisLockRef.current));
  }
};
