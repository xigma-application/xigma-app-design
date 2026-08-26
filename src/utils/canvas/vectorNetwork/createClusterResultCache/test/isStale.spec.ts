// types
import { TCacheEntry } from '../types';
import { TPlanarVectorNetwork } from '../../planarizeVectorNetwork/types';
import { TVectorNodeCluster } from '../../getVectorNodeClusters/types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { isStale } from '../isStale';

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });
const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });

const buildPlanar = (vertices: TVectorVertex[], segments: TVectorSegment[]): TPlanarVectorNetwork => ({
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
});

const buildScene = () => {
  const planar = buildPlanar([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('s1', 'a', 'b')]);
  const cluster: TVectorNodeCluster = { key: 'a,b', segmentIds: ['s1'], vertexIds: ['a', 'b'] };
  const entry: TCacheEntry<string> = {
    result: 'computed',
    segments: new Map(cluster.segmentIds.map((id) => [id, planar.segments[id]])),
    vertices: new Map(cluster.vertexIds.map((id) => [id, planar.vertices[id]])),
  };

  return { cluster, entry, planar };
};

describe('isStale', () => {
  it('should not be stale when every member reference still matches the planar network', () => {
    const { cluster, entry, planar } = buildScene();

    expect(isStale(entry, cluster, planar)).toBe(false);
  });

  it('should be stale when a vertex id resolves to a new object reference', () => {
    const { cluster, entry, planar } = buildScene();
    const moved: TPlanarVectorNetwork = { ...planar, vertices: { ...planar.vertices, a: vertex('a', 5, 5) } };

    expect(isStale(entry, cluster, moved)).toBe(true);
  });

  it('should be stale when a segment id resolves to a new object reference', () => {
    const { cluster, entry, planar } = buildScene();
    const edited: TPlanarVectorNetwork = {
      ...planar,
      segments: { ...planar.segments, s1: { ...planar.segments.s1, tangentStart: { x: 1, y: 1 } } },
    };

    expect(isStale(entry, cluster, edited)).toBe(true);
  });

  it('should be stale when the cluster gained a vertex not present in the cached entry', () => {
    const { cluster, entry, planar } = buildScene();
    const grownCluster: TVectorNodeCluster = { ...cluster, vertexIds: [...cluster.vertexIds, 'c'] };
    const grownPlanar: TPlanarVectorNetwork = { ...planar, vertices: { ...planar.vertices, c: vertex('c', 20, 0) } };

    expect(isStale(entry, grownCluster, grownPlanar)).toBe(true);
  });

  it('should be stale when the cluster gained a segment not present in the cached entry', () => {
    const { cluster, entry, planar } = buildScene();
    const grownCluster: TVectorNodeCluster = { ...cluster, segmentIds: [...cluster.segmentIds, 's2'] };
    const grownPlanar: TPlanarVectorNetwork = { ...planar, segments: { ...planar.segments, s2: seg('s2', 'a', 'b') } };

    expect(isStale(entry, grownCluster, grownPlanar)).toBe(true);
  });
});
