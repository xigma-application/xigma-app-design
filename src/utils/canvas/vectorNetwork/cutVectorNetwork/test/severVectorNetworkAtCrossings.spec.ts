// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TLineNetworkCrossing } from '../types';

// utils
import { severVectorNetworkAtCrossings } from '../severVectorNetworkAtCrossings';

describe('severVectorNetworkAtCrossings', () => {
  it('should sever only the crossed segment, leaving untouched segments identical', () => {
    // mock — two segments, only s1 is crossed
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 0 },
      c: { id: 'c', x: 0, y: 100 },
      d: { id: 'd', x: 100, y: 100 },
    };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null },
    };
    const crossings: TLineNetworkCrossing[] = [{ lineT: 0.5, point: { x: 50, y: 0 }, segmentId: 's1', t: 0.5 }];

    // before
    const result = severVectorNetworkAtCrossings(segments, vertices, crossings);

    // result
    expect(Object.keys(result.segments).sort()).toEqual(['s1#0', 's1#1', 's2']);
    expect(result.segments.s2).toEqual(segments.s2);
    expect(result.vertices.a).toEqual(vertices.a);
    expect(result.vertices.c).toEqual(vertices.c);
  });

  it('should sever multiple crossed segments independently', () => {
    // mock — both segments crossed once each
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 0 },
      c: { id: 'c', x: 0, y: 100 },
      d: { id: 'd', x: 100, y: 100 },
    };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null },
    };
    const crossings: TLineNetworkCrossing[] = [
      { lineT: 0.5, point: { x: 50, y: 0 }, segmentId: 's1', t: 0.5 },
      { lineT: 0.5, point: { x: 50, y: 100 }, segmentId: 's2', t: 0.5 },
    ];

    // before
    const result = severVectorNetworkAtCrossings(segments, vertices, crossings);

    // result
    expect(Object.keys(result.segments).sort()).toEqual(['s1#0', 's1#1', 's2#0', 's2#1']);
  });

  it("should sort a single segment's multiple crossings into t order before severing, regardless of input order", () => {
    // mock — s1 crossed twice; crossings passed in scrambled (descending) order
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 300, y: 0 } };
    const segments: Record<string, TVectorSegment> = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const crossings: TLineNetworkCrossing[] = [
      { lineT: 0.5, point: { x: 200, y: 0 }, segmentId: 's1', t: 2 / 3 },
      { lineT: 0.5, point: { x: 100, y: 0 }, segmentId: 's1', t: 1 / 3 },
    ];

    // before
    const result = severVectorNetworkAtCrossings(segments, vertices, crossings);

    // result
    expect(Object.keys(result.segments)).toEqual(['s1#0', 's1#1', 's1#2']);
    expect(result.segments['s1#0'].startId).toBe('a');
    expect(result.segments['s1#2'].endId).toBe('b');
  });

  it('should pass every segment through unchanged when there are no crossings at all', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segments: Record<string, TVectorSegment> = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };

    // before
    const result = severVectorNetworkAtCrossings(segments, vertices, []);

    // result
    expect(result.segments).toEqual(segments);
    expect(result.vertices).toEqual(vertices);
  });
});
