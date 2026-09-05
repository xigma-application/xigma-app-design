import { useRef } from 'react';

// types
import { TAxisLock } from 'utils/math/axis/getAxisLockedPoint';
import { TPencilDragRefs } from '../../types';
import { TPoint } from 'types/canvas';

export const usePencilDragRefs = (): TPencilDragRefs => {
  const axisLockRef = useRef<TAxisLock | null>(null);
  const committedPointsRef = useRef<TPoint[] | null>(null);
  const rawPointsRef = useRef<TPoint[] | null>(null);
  const shiftAnchorRef = useRef<TPoint | null>(null);
  const tailPointsRef = useRef<TPoint[] | null>(null);
  const pencilDragRefsRef = useRef<TPencilDragRefs | null>(null);

  if (pencilDragRefsRef.current === null) {
    pencilDragRefsRef.current = { axisLockRef, committedPointsRef, rawPointsRef, shiftAnchorRef, tailPointsRef };
  }

  return pencilDragRefsRef.current;
};
