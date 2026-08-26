// types
import { TVectorNodeCluster } from '../../getVectorNodeClusters/types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenClusterSegments } from '../flattenClusterSegments';

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });
const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });

describe('flattenClusterSegments', () => {
  it('should flatten every segment id in the cluster, keeping their start/end/segment ids', () => {
    const segments = { s1: seg('s1', 'a', 'b') };
    const vertices = { a: vertex('a', 0, 0), b: vertex('b', 10, 0) };
    const cluster: TVectorNodeCluster = { key: 'a,b', segmentIds: ['s1'], vertexIds: ['a', 'b'] };

    const result = flattenClusterSegments(cluster, segments, vertices);

    expect(result).toHaveLength(1);
    expect(result[0].segmentId).toBe('s1');
    expect(result[0].startId).toBe('a');
    expect(result[0].endId).toBe('b');
    expect(result[0].points[0]).toEqual(expect.objectContaining({ x: 0, y: 0 }));
    expect(result[0].points[result[0].points.length - 1]).toEqual(expect.objectContaining({ x: 10, y: 0 }));
  });

  it('should return one flattened entry per segment id, in cluster order', () => {
    const segments = { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') };
    const vertices = { a: vertex('a', 0, 0), b: vertex('b', 10, 0), c: vertex('c', 10, 10) };
    const cluster: TVectorNodeCluster = { key: 'a,b,c', segmentIds: ['s1', 's2'], vertexIds: ['a', 'b', 'c'] };

    const result = flattenClusterSegments(cluster, segments, vertices);

    expect(result.map((entry) => entry.segmentId)).toEqual(['s1', 's2']);
  });
});
