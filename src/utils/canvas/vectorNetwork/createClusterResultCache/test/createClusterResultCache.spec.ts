// types
import { TPlanarVectorNetwork } from '../../planarizeVectorNetwork/types';
import { TVectorNodeCluster } from '../../getVectorNodeClusters/types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { createClusterResultCache } from '../createClusterResultCache';

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });
const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });

const buildPlanar = (vertices: TVectorVertex[], segments: TVectorSegment[]): TPlanarVectorNetwork => ({
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
});

const buildScene = () => {
  const planar = buildPlanar([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('s1', 'a', 'b')]);
  const cluster: TVectorNodeCluster = { key: 'a,b', segmentIds: ['s1'], vertexIds: ['a', 'b'] };

  return { cluster, planar };
};

describe('createClusterResultCache', () => {
  it('should compute and return the result on a first lookup', () => {
    // mock
    const cache = createClusterResultCache<string>(10);
    const { cluster, planar } = buildScene();
    const compute = vi.fn().mockReturnValue('computed');

    // before
    const result = cache.get('node-1', cluster, '', planar, compute);

    // result
    expect(result).toBe('computed');
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('should not recompute on a second lookup for the same node id, cluster, and unchanged member references', () => {
    // mock
    const cache = createClusterResultCache<string>(10);
    const { cluster, planar } = buildScene();
    const compute = vi.fn().mockReturnValue('computed');

    // before
    cache.get('node-1', cluster, '', planar, compute);
    const second = cache.get('node-1', cluster, '', planar, compute);

    // result
    expect(second).toBe('computed');
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('should recompute when a member vertex resolves to a new object reference under the same id — a moved vertex, not a topology change', () => {
    // mock — same node id, same cluster id-set, but the vertex "a" now points at a fresh object
    // (exactly what a Redux `{...vertices, a: newVertex}` spread produces for a dragged vertex)
    const cache = createClusterResultCache<string>(10);
    const { cluster, planar: firstPlanar } = buildScene();
    const movedPlanar = buildPlanar([vertex('a', 5, 5), firstPlanar.vertices.b], [firstPlanar.segments.s1]);
    const compute = vi.fn().mockReturnValueOnce('first').mockReturnValueOnce('second');

    // before
    const first = cache.get('node-1', cluster, '', firstPlanar, compute);
    const second = cache.get('node-1', cluster, '', movedPlanar, compute);

    // result
    expect(first).toBe('first');
    expect(second).toBe('second');
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('should recompute when a member segment resolves to a new object reference under the same id — e.g. an edited tangent handle', () => {
    // mock
    const cache = createClusterResultCache<string>(10);
    const { cluster, planar: firstPlanar } = buildScene();
    const editedSegment: TVectorSegment = { ...firstPlanar.segments.s1, tangentStart: { x: 1, y: 1 } };
    const editedPlanar = buildPlanar([firstPlanar.vertices.a, firstPlanar.vertices.b], [editedSegment]);
    const compute = vi.fn().mockReturnValueOnce('first').mockReturnValueOnce('second');

    // before
    cache.get('node-1', cluster, '', firstPlanar, compute);
    const second = cache.get('node-1', cluster, '', editedPlanar, compute);

    // result
    expect(second).toBe('second');
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('should not share a cache entry across two different extraKey suffixes for the same cluster (loop-key scoping)', () => {
    // mock
    const cache = createClusterResultCache<string>(10);
    const { cluster, planar } = buildScene();
    const compute = vi.fn().mockReturnValueOnce('loop-a-result').mockReturnValueOnce('loop-b-result');

    // before
    const forLoopA = cache.get('node-1', cluster, 'loop-a', planar, compute);
    const forLoopB = cache.get('node-1', cluster, 'loop-b', planar, compute);

    // result
    expect(forLoopA).toBe('loop-a-result');
    expect(forLoopB).toBe('loop-b-result');
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('should not share a cache entry across two different node ids, even for an identical cluster shape', () => {
    // mock
    const cache = createClusterResultCache<string>(10);
    const { cluster, planar } = buildScene();
    const compute = vi.fn().mockReturnValueOnce('for-node-1').mockReturnValueOnce('for-node-2');

    // before
    cache.get('node-1', cluster, '', planar, compute);
    cache.get('node-2', cluster, '', planar, compute);

    // result
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('should stay a hit when the cluster’s own id arrays are reordered but reference the same members', () => {
    // mock — getVectorNodeClusters' BFS order isn't guaranteed stable across recomputations; the
    // cache must key/compare by id set, not by array position
    const cache = createClusterResultCache<string>(10);
    const { cluster, planar } = buildScene();
    const reordered: TVectorNodeCluster = {
      key: cluster.key,
      segmentIds: [...cluster.segmentIds],
      vertexIds: [...cluster.vertexIds].reverse(),
    };
    const compute = vi.fn().mockReturnValue('computed');

    // before
    cache.get('node-1', cluster, '', planar, compute);
    const second = cache.get('node-1', reordered, '', planar, compute);

    // result
    expect(second).toBe('computed');
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('should evict the least-recently-used entry once past capacity', () => {
    // mock — capacity 2; filling a third distinct cluster key must evict the first, untouched one
    const cache = createClusterResultCache<string>(2);
    const planar = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 1, 0), vertex('c', 2, 0), vertex('d', 3, 0), vertex('e', 4, 0), vertex('f', 5, 0)],
      [seg('s1', 'a', 'b'), seg('s2', 'c', 'd'), seg('s3', 'e', 'f')],
    );
    const clusterA: TVectorNodeCluster = { key: 'a,b', segmentIds: ['s1'], vertexIds: ['a', 'b'] };
    const clusterB: TVectorNodeCluster = { key: 'c,d', segmentIds: ['s2'], vertexIds: ['c', 'd'] };
    const clusterC: TVectorNodeCluster = { key: 'e,f', segmentIds: ['s3'], vertexIds: ['e', 'f'] };
    const computeA = vi.fn().mockReturnValue('a');
    const computeB = vi.fn().mockReturnValue('b');
    const computeC = vi.fn().mockReturnValue('c');

    // before
    cache.get('node-1', clusterA, '', planar, computeA);
    cache.get('node-1', clusterB, '', planar, computeB);
    cache.get('node-1', clusterC, '', planar, computeC);
    cache.get('node-1', clusterA, '', planar, computeA);

    // result — A was the oldest and unused since insertion, so it was evicted and had to recompute
    expect(computeA).toHaveBeenCalledTimes(2);
    expect(computeB).toHaveBeenCalledTimes(1);
    expect(computeC).toHaveBeenCalledTimes(1);
  });

  it('should keep a recently-hit entry alive past capacity instead of evicting it purely by insertion age', () => {
    // mock — capacity 2; touching A again before inserting C should make B the eviction target, not A
    const cache = createClusterResultCache<string>(2);
    const planar = buildPlanar(
      [vertex('a', 0, 0), vertex('b', 1, 0), vertex('c', 2, 0), vertex('d', 3, 0), vertex('e', 4, 0), vertex('f', 5, 0)],
      [seg('s1', 'a', 'b'), seg('s2', 'c', 'd'), seg('s3', 'e', 'f')],
    );
    const clusterA: TVectorNodeCluster = { key: 'a,b', segmentIds: ['s1'], vertexIds: ['a', 'b'] };
    const clusterB: TVectorNodeCluster = { key: 'c,d', segmentIds: ['s2'], vertexIds: ['c', 'd'] };
    const clusterC: TVectorNodeCluster = { key: 'e,f', segmentIds: ['s3'], vertexIds: ['e', 'f'] };
    const computeA = vi.fn().mockReturnValue('a');
    const computeB = vi.fn().mockReturnValue('b');
    const computeC = vi.fn().mockReturnValue('c');

    // before
    cache.get('node-1', clusterA, '', planar, computeA);
    cache.get('node-1', clusterB, '', planar, computeB);
    cache.get('node-1', clusterA, '', planar, computeA); // touch A again — B is now the oldest
    cache.get('node-1', clusterC, '', planar, computeC); // evicts B, not A

    // result
    expect(computeA).toHaveBeenCalledTimes(1);
    cache.get('node-1', clusterB, '', planar, computeB);
    expect(computeB).toHaveBeenCalledTimes(2);
  });
});
