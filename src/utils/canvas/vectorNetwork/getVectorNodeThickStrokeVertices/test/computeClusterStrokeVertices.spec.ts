// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';
import { TVectorNodeCluster } from '../../getVectorNodeClusters/types';

// utils
import { computeClusterStrokeVertices } from '../computeClusterStrokeVertices';

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });
const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });

const buildNode = (vertices: TVectorVertex[], segments: TVectorSegment[]): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
});

describe('computeClusterStrokeVertices', () => {
  it('should tessellate a single straight segment into a halfWidth-wide rectangle (2 triangles, 12 numbers)', () => {
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('ab', 'a', 'b')]);
    const cluster: TVectorNodeCluster = { key: 'a,b', segmentIds: ['ab'], vertexIds: ['a', 'b'] };
    const rawNetwork = { segments: node.segments, vertices: node.vertices };

    const vertices = computeClusterStrokeVertices(cluster, node, 5, rawNetwork);

    expect(vertices).toHaveLength(12);
  });

  it('should return the same array reference for a repeat call with an unchanged cluster and network', () => {
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('ab', 'a', 'b')]);
    const cluster: TVectorNodeCluster = { key: 'a,b', segmentIds: ['ab'], vertexIds: ['a', 'b'] };
    const rawNetwork = { segments: node.segments, vertices: node.vertices };

    const first = computeClusterStrokeVertices(cluster, node, 5, rawNetwork);
    const second = computeClusterStrokeVertices(cluster, node, 5, rawNetwork);

    expect(second).not.toBe(first);
    expect(second).toEqual(first);
  });
});
