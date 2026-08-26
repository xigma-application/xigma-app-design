// types
import { TCachedFlattenedSegment } from './types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenForCrossingSearch } from '../flattenForCrossingSearch';
import { getBoundingBox } from './getBoundingBox';

const flattenedSegmentCache = new WeakMap<TVectorSegment, TCachedFlattenedSegment>();

export const getCachedFlattenedSegment = (segment: TVectorSegment, vertices: Record<string, TVectorVertex>): TCachedFlattenedSegment => {
  const startVertex = vertices[segment.startId];
  const endVertex = vertices[segment.endId];
  const cached = flattenedSegmentCache.get(segment);

  if (cached && cached.startVertex === startVertex && cached.endVertex === endVertex) {
    return cached;
  }

  const points = flattenForCrossingSearch(segment, vertices);
  const entry: TCachedFlattenedSegment = { bbox: getBoundingBox(points), endVertex, points, startVertex };

  flattenedSegmentCache.set(segment, entry);
  return entry;
};
