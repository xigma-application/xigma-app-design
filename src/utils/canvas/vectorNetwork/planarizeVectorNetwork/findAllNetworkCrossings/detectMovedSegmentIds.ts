// types
import { TCachedFlattenedSegment } from './types';
import { TVectorSegment } from 'types/design/types';

export const detectMovedSegmentIds = (
  segments: TVectorSegment[],
  cachedById: Map<string, TCachedFlattenedSegment>,
  lastEntryBySegmentId: Map<string, TCachedFlattenedSegment>,
  maxMoved: number,
): string[] | null => {
  if (lastEntryBySegmentId.size !== segments.length) {
    return null;
  }

  const movedIds: string[] = [];

  for (const segment of segments) {
    const lastEntry = lastEntryBySegmentId.get(segment.id);

    if (lastEntry === undefined) {
      return null;
    }

    if (cachedById.get(segment.id) !== lastEntry) {
      movedIds.push(segment.id);

      if (movedIds.length > maxMoved) {
        return null;
      }
    }
  }

  return movedIds;
};
