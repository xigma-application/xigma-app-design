// types
import { TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { computeClusters } from '../computeClusters';

const seg = (
  id: string,
  startId: string,
  endId: string,
  tangentStart: TVectorTangent = null,
  tangentEnd: TVectorTangent = null,
): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd,
  tangentStart,
});

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

const toRecords = (
  vertices: TVectorVertex[],
  segments: TVectorSegment[],
): { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => ({
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
});

describe('computeClusters', () => {
  it('should return no clusters for an empty network', () => {
    const { segments, vertices } = toRecords([], []);

    expect(computeClusters(segments, vertices)).toEqual([]);
  });

  it('should skip an isolated vertex with no segments', () => {
    const { segments, vertices } = toRecords([vertex('lonely', 0, 0)], []);

    expect(computeClusters(segments, vertices)).toEqual([]);
  });

  it('should give each cluster a key built from its sorted vertex ids', () => {
    const { segments, vertices } = toRecords([vertex('b', 10, 0), vertex('a', 0, 0)], [seg('ab', 'a', 'b')]);

    const clusters = computeClusters(segments, vertices);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].key).toBe('a,b');
  });
});
