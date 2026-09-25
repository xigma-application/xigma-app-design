// types
import { TCachedFlattenedSegment } from '../types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getCachedFlattenedSegment } from '../getCachedFlattenedSegment';

export const straightSegment = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

export const crossVertices: Record<string, TVectorVertex> = {
  far1: { id: 'far1', x: 100, y: 100 },
  far2: { id: 'far2', x: 110, y: 100 },
  h1: { id: 'h1', x: 0, y: 5 },
  h2: { id: 'h2', x: 10, y: 5 },
  v1: { id: 'v1', x: 5, y: 0 },
  v2: { id: 'v2', x: 5, y: 10 },
};

export const crossSegments = [straightSegment('h', 'h1', 'h2'), straightSegment('v', 'v1', 'v2'), straightSegment('far', 'far1', 'far2')];

export const cacheSegments = (segments: TVectorSegment[], vertices: Record<string, TVectorVertex>): Map<string, TCachedFlattenedSegment> =>
  new Map(segments.map((segment) => [segment.id, getCachedFlattenedSegment(segment, vertices)]));
