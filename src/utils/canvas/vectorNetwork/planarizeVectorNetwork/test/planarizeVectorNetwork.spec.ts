// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { planarizeVectorNetwork } from '../planarizeVectorNetwork';

describe('planarizeVectorNetwork', () => {
  it('should return the ORIGINAL segments/vertices objects verbatim (same references, not rebuilt copies) when nothing crosses', () => {
    // mock — two disjoint, non-crossing straight segments; the reference-identity check matters here,
    // not just deep equality — an unrelated caller relies on this to cheaply tell "did anything change"
    // via a plain === check instead of re-deriving/re-clustering an unchanged network a second time
    const vertices: Record<string, TVectorVertex> = {
      a1: { id: 'a1', x: 0, y: 0 },
      a2: { id: 'a2', x: 100, y: 0 },
      b1: { id: 'b1', x: 0, y: 100 },
      b2: { id: 'b2', x: 100, y: 100 },
    };
    const segments: Record<string, TVectorSegment> = {
      sA: { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null },
      sB: { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null },
    };

    // before
    const result = planarizeVectorNetwork(null, segments, vertices);

    // result
    expect(result.segments).toBe(segments);
    expect(result.vertices).toBe(vertices);
  });

  it('should split both crossing segments and add exactly one new virtual vertex at their crossing point', () => {
    // mock — two straight segments crossing at (50,0), sharing no vertex
    const vertices: Record<string, TVectorVertex> = {
      a1: { id: 'a1', x: 0, y: 0 },
      a2: { id: 'a2', x: 100, y: 0 },
      b1: { id: 'b1', x: 50, y: -50 },
      b2: { id: 'b2', x: 50, y: 50 },
    };
    const segments: Record<string, TVectorSegment> = {
      sA: { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null },
      sB: { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null },
    };

    // before
    const result = planarizeVectorNetwork(null, segments, vertices);

    // result
    expect(Object.keys(result.segments).sort()).toEqual(['sA#0', 'sA#1', 'sB#0', 'sB#1']);
    expect(Object.keys(result.vertices)).toHaveLength(5); // the 4 original endpoints + 1 new crossing vertex

    const newVertexId = Object.keys(result.vertices).find((id) => !(id in vertices))!;

    expect(result.vertices[newVertexId].x).toBeCloseTo(50, 4);
    expect(result.vertices[newVertexId].y).toBeCloseTo(0, 4);
  });
});
