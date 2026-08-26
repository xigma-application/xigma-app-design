// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';
import { TVectorNodeCluster } from '../../getVectorNodeClusters/types';

// utils
import { getNodeStrokeVertices } from '../getNodeStrokeVertices';

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

describe('getNodeStrokeVertices', () => {
  it('should sum every cluster’s own stroke vertices, with no cross-cluster interference', () => {
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 500, 500), vertex('d', 600, 500)],
      [seg('ab', 'a', 'b'), seg('cd', 'c', 'd')],
    );
    const clusters: TVectorNodeCluster[] = [
      { key: 'a,b', segmentIds: ['ab'], vertexIds: ['a', 'b'] },
      { key: 'c,d', segmentIds: ['cd'], vertexIds: ['c', 'd'] },
    ];
    const rawNetwork = { segments: node.segments, vertices: node.vertices };

    const vertices = getNodeStrokeVertices(node, 5, clusters, rawNetwork);

    expect(vertices).toHaveLength(24);
  });

  it('should return an empty array for no clusters', () => {
    const node = buildNode([], []);
    const rawNetwork = { segments: node.segments, vertices: node.vertices };

    expect(getNodeStrokeVertices(node, 5, [], rawNetwork)).toEqual([]);
  });
});
