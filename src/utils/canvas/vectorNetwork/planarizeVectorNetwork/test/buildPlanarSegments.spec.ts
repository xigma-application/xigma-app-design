// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { buildPlanarSegments } from '../buildPlanarSegments';

describe('buildPlanarSegments', () => {
  it('should pass a segment through unchanged when it has no recorded crossings', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // before
    const result = buildPlanarSegments([segment], vertices, new Map());

    // result
    expect(result).toEqual({ s1: segment });
  });

  it('should replace a segment with its split pieces when it has recorded crossings, dropping the original id', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };
    const crossingsBySegmentId = new Map([['s1', [{ t: 0.5, vertexId: 'x1' }]]]);

    // before
    const result = buildPlanarSegments([segment], vertices, crossingsBySegmentId);

    // result
    expect(Object.keys(result).sort()).toEqual(['s1#0', 's1#1']);
    expect(result.s1).toBeUndefined();
  });

  it('should sort multiple crossings on the same segment by t before splitting, regardless of input order', () => {
    // mock — crossings passed in DESCENDING t order
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 300, y: 0 } };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };
    const crossingsBySegmentId = new Map([
      [
        's1',
        [
          { t: 0.7, vertexId: 'x2' },
          { t: 0.3, vertexId: 'x1' },
        ],
      ],
    ]);

    // before
    const result = buildPlanarSegments([segment], vertices, crossingsBySegmentId);

    // result — piece #0 must end at the LOWER-t crossing (x1), regardless of the input array's own order
    expect(result['s1#0'].endId).toBe('x1');
    expect(result['s1#1'].endId).toBe('x2');
  });
});
