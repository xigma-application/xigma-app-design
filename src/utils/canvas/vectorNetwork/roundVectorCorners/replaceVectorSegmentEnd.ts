// types
import { TVectorSegment } from 'types/design/types';

export const replaceVectorSegmentEnd = (segment: TVectorSegment, vertexId: string, nextId: string): TVectorSegment =>
  segment.startId === vertexId ? { ...segment, startId: nextId } : { ...segment, endId: nextId };
