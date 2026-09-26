// types
import { TVectorSegment } from 'types/design/types';

export const isStraightVectorSegmentAt = (segment: TVectorSegment, vertexId: string): boolean =>
  segment.tangentStart === null &&
  segment.tangentEnd === null &&
  segment.startId !== segment.endId &&
  [segment.startId, segment.endId].includes(vertexId);
