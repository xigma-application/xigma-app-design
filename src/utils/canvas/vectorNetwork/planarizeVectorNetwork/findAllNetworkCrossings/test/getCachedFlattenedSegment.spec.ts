// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getCachedFlattenedSegment } from '../getCachedFlattenedSegment';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });

describe('getCachedFlattenedSegment', () => {
  it('should flatten a straight segment into its endpoint bounding box', () => {
    const segment = seg('s1', 'a', 'b');
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } };

    const result = getCachedFlattenedSegment(segment, vertices);

    expect(result.bbox).toEqual({ maxX: 10, maxY: 0, minX: 0, minY: 0 });
    expect(result.startVertex).toBe(vertices.a);
    expect(result.endVertex).toBe(vertices.b);
  });

  it('should return the same cached entry on a second call with unchanged endpoint vertex references', () => {
    const segment = seg('s1', 'a', 'b');
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } };

    const first = getCachedFlattenedSegment(segment, vertices);
    const second = getCachedFlattenedSegment(segment, vertices);

    expect(second).toBe(first);
  });

  it('should recompute when an endpoint vertex moves to a new object, even though the segment object is unchanged', () => {
    const segment = seg('s1', 'a', 'b');
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } };
    const movedVertices: Record<string, TVectorVertex> = { a: vertices.a, b: { id: 'b', x: 20, y: 0 } };

    const first = getCachedFlattenedSegment(segment, vertices);
    const second = getCachedFlattenedSegment(segment, movedVertices);

    expect(second).not.toBe(first);
    expect(second.bbox).toEqual({ maxX: 20, maxY: 0, minX: 0, minY: 0 });
  });
});
