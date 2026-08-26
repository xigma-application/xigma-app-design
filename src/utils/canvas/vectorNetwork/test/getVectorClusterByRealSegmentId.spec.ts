// types
import { TVectorNodeCluster } from '../getVectorNodeClusters/types';

// utils
import { getVectorClusterByRealSegmentId } from '../getVectorClusterByRealSegmentId';

describe('getVectorClusterByRealSegmentId', () => {
  it('should key a cluster by the real (unsplit) segment id for a plain, uncrossed piece id', () => {
    // mock
    const cluster: TVectorNodeCluster = { key: 'a,b,c', segmentIds: ['s1', 's2'], vertexIds: ['a', 'b', 'c'] };

    // before
    const map = getVectorClusterByRealSegmentId([cluster]);

    // result
    expect(map.get('s1')).toBe(cluster);
    expect(map.get('s2')).toBe(cluster);
  });

  it('should strip the "#n" planar-split suffix off a crossing-split piece id before keying', () => {
    // mock
    const cluster: TVectorNodeCluster = { key: 'a,b,c', segmentIds: ['s1#0', 's1#1', 's2#0'], vertexIds: ['a', 'b', 'c'] };

    // before
    const map = getVectorClusterByRealSegmentId([cluster]);

    // result — both pieces of s1 resolve to the same real id, and to the same cluster
    expect(map.get('s1')).toBe(cluster);
    expect(map.get('s2')).toBe(cluster);
    expect(map.has('s1#0')).toBe(false);
  });

  it('should return undefined for a real segment id that belongs to no cluster', () => {
    // mock
    const cluster: TVectorNodeCluster = { key: 'a,b', segmentIds: ['s1'], vertexIds: ['a', 'b'] };

    // result
    expect(getVectorClusterByRealSegmentId([cluster]).get('unknown')).toBeUndefined();
  });

  it('should map each of several clusters to their own distinct real segment ids', () => {
    // mock
    const clusterA: TVectorNodeCluster = { key: 'a,b', segmentIds: ['s1'], vertexIds: ['a', 'b'] };
    const clusterB: TVectorNodeCluster = { key: 'c,d', segmentIds: ['s2'], vertexIds: ['c', 'd'] };

    // before
    const map = getVectorClusterByRealSegmentId([clusterA, clusterB]);

    // result
    expect(map.get('s1')).toBe(clusterA);
    expect(map.get('s2')).toBe(clusterB);
  });

  it('should return the same map reference for the same clusters array reference', () => {
    // mock
    const clusters: TVectorNodeCluster[] = [{ key: 'a,b', segmentIds: ['s1'], vertexIds: ['a', 'b'] }];

    // before
    const first = getVectorClusterByRealSegmentId(clusters);
    const second = getVectorClusterByRealSegmentId(clusters);

    // result
    expect(second).toBe(first);
  });
});
