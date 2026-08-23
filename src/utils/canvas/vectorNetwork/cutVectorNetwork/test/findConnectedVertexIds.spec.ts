// types
import { TVectorSegment } from 'types/design/types';

// utils
import { buildVectorAdjacency } from '../buildVectorAdjacency';
import { findConnectedVertexIds } from '../findConnectedVertexIds';

describe('findConnectedVertexIds', () => {
  it('should return every vertex reachable from the seed through the segment graph', () => {
    // mock — a-b-c chain, plus a disconnected d-e pair
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      s3: { endId: 'e', id: 's3', startId: 'd', tangentEnd: null, tangentStart: null },
    };
    const adjacency = buildVectorAdjacency(segments);

    // before
    const reachableFromA = findConnectedVertexIds('a', segments, adjacency);
    const reachableFromD = findConnectedVertexIds('d', segments, adjacency);

    // result
    expect(reachableFromA).toEqual(new Set(['a', 'b', 'c']));
    expect(reachableFromD).toEqual(new Set(['d', 'e']));
  });

  it('should return just the seed itself when it has no connected segments', () => {
    // mock
    const segments: Record<string, TVectorSegment> = {};
    const adjacency = buildVectorAdjacency(segments);

    // before
    const reachable = findConnectedVertexIds('lonely', segments, adjacency);

    // result
    expect(reachable).toEqual(new Set(['lonely']));
  });

  it('should not revisit a vertex reachable via a cycle', () => {
    // mock — a-b-c-a triangle
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    };
    const adjacency = buildVectorAdjacency(segments);

    // before
    const reachable = findConnectedVertexIds('a', segments, adjacency);

    // result
    expect(reachable).toEqual(new Set(['a', 'b', 'c']));
  });
});
