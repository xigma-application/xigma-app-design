// types
import { TVectorNode } from 'types/design/types';
import { TErasedNetwork, TSegmentEraseInterval } from '../types';

// utils
import { eraseSegmentEnd } from './eraseSegmentEnd';
import { eraseSegmentMiddle } from './eraseSegmentMiddle';
import { eraseSegmentStart } from './eraseSegmentStart';
import { eraseWholeSegment } from './eraseWholeSegment';

export const applySegmentErase = (
  node: TVectorNode,
  segmentId: string,
  interval: Exclude<TSegmentEraseInterval, { kind: 'none' }>,
): TErasedNetwork => {
  switch (interval.kind) {
    case 'whole':
      return eraseWholeSegment(node, segmentId);
    case 'start':
      return eraseSegmentStart(node, segmentId, interval.tOut);
    case 'end':
      return eraseSegmentEnd(node, segmentId, interval.tIn);
    default:
      return eraseSegmentMiddle(node, segmentId, interval.tIn, interval.tOut);
  }
};
