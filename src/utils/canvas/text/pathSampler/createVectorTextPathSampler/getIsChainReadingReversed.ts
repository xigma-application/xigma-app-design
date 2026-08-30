// types
import { TVectorChainArcLengthSample } from '../../../vectorNetwork/getVectorChainArcLengthTable';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorSegmentPointAtT } from '../../../vectorNetwork/getVectorSegmentPointAtT';

export const getIsChainReadingReversed = (rendered: TVectorNode, isClosed: boolean, table: TVectorChainArcLengthSample[]): boolean => {
  if (isClosed) {
    return false;
  }

  const totalLength = table[table.length - 1].length;

  if (totalLength === 0) {
    return false;
  }

  const first = table[0];
  const last = table[table.length - 1];
  const start = getVectorSegmentPointAtT(rendered, rendered.segments[first.segmentId], first.t);
  const end = getVectorSegmentPointAtT(rendered, rendered.segments[last.segmentId], last.t);
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  return dx < 0 || (dx === 0 && dy < 0);
};
