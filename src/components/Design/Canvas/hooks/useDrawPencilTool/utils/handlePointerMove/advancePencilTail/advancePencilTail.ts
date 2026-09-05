// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPencilDragRefs } from '../../../types';
import { TPoint } from 'types/canvas';

// utils
import { commitTailChunkIfReady } from './commitTailChunkIfReady';
import { foldPendingAxisLockIntoTail } from './foldPendingAxisLockIntoTail';
import { pushThrottledPoint } from './pushThrottledPoint';
import { simplifyPencilPoints } from '../../simplifyPencilPoints';

export const advancePencilTail = (
  refs: TCanvasRefs,
  pencilDragRefs: TPencilDragRefs,
  committed: TPoint[],
  tail: TPoint[],
  currentPoint: TPoint,
  zoom: number,
  tolerance: number,
): void => {
  foldPendingAxisLockIntoTail(tail, pencilDragRefs, currentPoint);
  pushThrottledPoint(tail, currentPoint, zoom);

  const latest = commitTailChunkIfReady(pencilDragRefs, committed, tail, zoom, tolerance);
  const previewTail = simplifyPencilPoints(latest.tail, tolerance);

  refs.pencil.pencilPreviewPointsRef.current = [...latest.committed, ...previewTail.slice(1)];
};
