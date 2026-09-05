import { RefObject } from 'react';

// types
import { TAxisLock } from 'utils/math/axis/getAxisLockedPoint';
import { TPoint } from 'types/canvas';

export type TPencilDragRefs = {
  axisLockRef: RefObject<TAxisLock | null>;
  committedPointsRef: RefObject<TPoint[] | null>;
  rawPointsRef: RefObject<TPoint[] | null>;
  shiftAnchorRef: RefObject<TPoint | null>;
  tailPointsRef: RefObject<TPoint[] | null>;
};
