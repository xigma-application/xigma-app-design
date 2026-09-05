// others
import { PENCIL_CHUNK_LENGTH_PX } from '../../../../../constants';

// types
import { TPencilDragRefs } from '../../../types';
import { TPoint } from 'types/canvas';

// utils
import { commitPencilTail } from '../../commitPencilTail';
import { getPathLength } from '../../getPathLength';

export const commitTailChunkIfReady = (
  pencilDragRefs: TPencilDragRefs,
  committed: TPoint[],
  tail: TPoint[],
  zoom: number,
  tolerance: number,
): { committed: TPoint[]; tail: TPoint[] } => {
  if (tail.length > 2 && getPathLength(tail) >= PENCIL_CHUNK_LENGTH_PX / zoom) {
    const latestCommitted = commitPencilTail(tail, committed, tolerance);
    const latestTail = [tail[tail.length - 1]];

    pencilDragRefs.committedPointsRef.current = latestCommitted;
    pencilDragRefs.tailPointsRef.current = latestTail;

    return { committed: latestCommitted, tail: latestTail };
  }

  return { committed, tail };
};
