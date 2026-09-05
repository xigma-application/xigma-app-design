// types
import { TPencilDragRefs } from '../../../types';
import { TPoint } from 'types/canvas';

// utils
import { getAxisLockedPoint } from 'utils/math/axis/getAxisLockedPoint';

export const foldPendingAxisLockIntoTail = (tail: TPoint[], pencilDragRefs: TPencilDragRefs, currentPoint: TPoint): void => {
  const { axisLockRef, shiftAnchorRef } = pencilDragRefs;

  if (axisLockRef.current && shiftAnchorRef.current) {
    tail.push(getAxisLockedPoint(shiftAnchorRef.current, currentPoint, axisLockRef.current));
  }

  axisLockRef.current = null;
  shiftAnchorRef.current = null;
};
