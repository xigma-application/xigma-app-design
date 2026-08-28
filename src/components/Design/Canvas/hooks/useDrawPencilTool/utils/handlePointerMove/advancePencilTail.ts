import { RefObject } from 'react';

// others
import { MIN_DRAG_DISTANCE_PX, PENCIL_CHUNK_LENGTH_PX } from '../../../../constants';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { commitPencilTail } from '../commitPencilTail';
import { getAxisLockedPoint, TAxisLock } from 'components/Design/Canvas/utils/getAxisLockedPoint';
import { getPathLength } from '../getPathLength';
import { simplifyPencilPoints } from '../simplifyPencilPoints';

export const advancePencilTail = (
  refs: TCanvasRefs,
  committedPointsRef: RefObject<TPoint[] | null>,
  tailPointsRef: RefObject<TPoint[] | null>,
  axisLockRef: RefObject<TAxisLock | null>,
  shiftAnchorRef: RefObject<TPoint | null>,
  committed: TPoint[],
  tail: TPoint[],
  currentPoint: TPoint,
  zoom: number,
  tolerance: number,
): void => {
  if (axisLockRef.current && shiftAnchorRef.current) {
    tail.push(getAxisLockedPoint(shiftAnchorRef.current, currentPoint, axisLockRef.current));
  }

  axisLockRef.current = null;
  shiftAnchorRef.current = null;

  const lastPoint = tail[tail.length - 1];
  const distance = Math.hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);

  if (distance >= MIN_DRAG_DISTANCE_PX / zoom) {
    tail.push(currentPoint);
  }

  let latestCommitted = committed;
  let latestTail = tail;

  if (tail.length > 2 && getPathLength(tail) >= PENCIL_CHUNK_LENGTH_PX / zoom) {
    latestCommitted = commitPencilTail(tail, committed, tolerance);
    latestTail = [tail[tail.length - 1]];
    committedPointsRef.current = latestCommitted;
    tailPointsRef.current = latestTail;
  }

  const previewTail = simplifyPencilPoints(latestTail, tolerance);

  refs.pencil.pencilPreviewPointsRef.current = [...latestCommitted, ...previewTail.slice(1)];
};
