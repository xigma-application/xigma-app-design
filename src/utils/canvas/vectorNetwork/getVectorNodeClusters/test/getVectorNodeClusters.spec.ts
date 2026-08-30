// types
import { TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';
import { TPlanarVectorNetwork } from '../../planarizeVectorNetwork/types';

// utils
import { getVectorNodeClusters } from '../getVectorNodeClusters';

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

const buildPlanar = (vertices: TVectorVertex[], segments: TVectorSegment[]): TPlanarVectorNetwork => ({
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
});

describe('getVectorNodeClusters', () => {
  it('should return no clusters for an empty network', () => {
    // result
    expect(getVectorNodeClusters('empty', buildPlanar([], []))).toEqual([]);
  });

  it('should skip an isolated vertex with no segments, same as splitVectorNetworkIntoComponents', () => {
    // mock
    const planar = buildPlanar([vertex('lonely', 0, 0)], []);

    // result
    expect(getVectorNodeClusters('isolated-vertex', planar)).toEqual([]);
  });

  it('should group one closed triangle into a single cluster covering all its segments/vertices', () => {
    // mock
    const planar = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );

    // before
    const clusters = getVectorNodeClusters('triangle', planar);

    // result
    expect(clusters).toHaveLength(1);
    expect(clusters[0].segmentIds.sort()).toEqual(['ab', 'bc', 'ca']);
    expect(clusters[0].vertexIds.sort()).toEqual(['a', 'b', 'c']);
  });

  it('should split two disjoint (no shared vertex) triangles into two independent clusters', () => {
    // mock — a second triangle far away, sharing no vertex with the first
    const planar = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10), vertex('d', 100, 0), vertex('e', 110, 0), vertex('f', 105, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a'), seg('de', 'd', 'e'), seg('ef', 'e', 'f'), seg('fd', 'f', 'd')],
    );

    // before
    const clusters = getVectorNodeClusters('two-triangles', planar);

    // result
    expect(clusters).toHaveLength(2);
    const bySize = [...clusters].sort((left, right) => left.vertexIds[0].localeCompare(right.vertexIds[0]));

    expect(new Set(bySize.flatMap((cluster) => cluster.vertexIds))).toEqual(new Set(['a', 'b', 'c', 'd', 'e', 'f']));
    expect(bySize.every((cluster) => cluster.segmentIds.length === 3)).toBe(true);
  });

  it('should merge two shapes that cross without sharing a vertex into one cluster, once planarized', () => {
    // mock — post-planarization, a crossing is represented as a real shared virtual vertex between
    // the split pieces of both original segments (planarizeVectorNetwork.ts/splitSegmentAtCrossings.ts
    // both use the SAME crossing.vertexId), so this is exactly what getPlanarVectorNetwork would hand
    // getVectorNodeClusters for two originally-disjoint shapes that visually overlap
    const crossing = vertex('x:h#0', 5, 5);
    const planar = buildPlanar(
      [vertex('h-start', 0, 5), vertex('h-end', 10, 5), vertex('v-start', 5, 0), vertex('v-end', 5, 10), crossing],
      [seg('h#0', 'h-start', 'x:h#0'), seg('h#1', 'x:h#0', 'h-end'), seg('v#0', 'v-start', 'x:h#0'), seg('v#1', 'x:h#0', 'v-end')],
    );

    // before
    const clusters = getVectorNodeClusters('crossing-shapes', planar);

    // result — one cluster, not two, since the crossing vertex is a real shared endpoint now
    expect(clusters).toHaveLength(1);
    expect(clusters[0].segmentIds.sort()).toEqual(['h#0', 'h#1', 'v#0', 'v#1']);
  });

  it('should return the same cluster array reference for the same planar network reference', () => {
    // mock
    const planar = buildPlanar([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('ab', 'a', 'b')]);

    // before
    const first = getVectorNodeClusters('same-reference', planar);
    const second = getVectorNodeClusters('same-reference', planar);

    // result
    expect(second).toBe(first);
  });

  it('should reuse the last-known clusters (skipping the graph walk) for a new planar reference whose segment topology is unchanged — e.g. a vertex moved without touching connectivity', () => {
    // mock — same segment id set/startId/endId as the triangle above, but every vertex has moved,
    // and it's a brand-new planar object (as getPlanarVectorNetwork/planarizeVectorNetwork would hand
    // back on any edit, since it never returns the exact same object twice)
    const first = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );
    const moved = buildPlanar(
      [vertex('a', 1, 1), vertex('b', 11, 1), vertex('c', 6, 11)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );

    // before
    const firstClusters = getVectorNodeClusters('incremental-drag', first);
    const secondClusters = getVectorNodeClusters('incremental-drag', moved);

    // result — the exact same cluster objects are reused, not recomputed, since topology is identical
    expect(secondClusters).toBe(firstClusters);
  });

  it('should recompute when the segment topology genuinely changes between two planar references for the same node id', () => {
    // mock — first a plain triangle, then a real topology change (a 4th vertex/segment added)
    const first = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );
    const withExtraSegment = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10), vertex('d', 20, 0)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a'), seg('bd', 'b', 'd')],
    );

    // before
    const firstClusters = getVectorNodeClusters('incremental-recompute', first);
    const secondClusters = getVectorNodeClusters('incremental-recompute', withExtraSegment);

    // result — genuinely different clusters, not the stale, reused ones
    expect(secondClusters).not.toBe(firstClusters);
    expect(secondClusters[0].segmentIds.sort()).toEqual(['ab', 'bc', 'bd', 'ca']);
  });
});
