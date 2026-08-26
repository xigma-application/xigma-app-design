// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { getVectorNodeRawClusters } from '../getVectorNodeRawClusters';

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

const buildNode = (vertices: TVectorVertex[], segments: TVectorSegment[]): TVectorNode => ({
  fillColor: '#000',
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

describe('getVectorNodeRawClusters', () => {
  it('should cluster the raw (unplanarized) node graph by shared-vertex adjacency alone', () => {
    // mock
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );

    // before
    const clusters = getVectorNodeRawClusters(node);

    // result
    expect(clusters).toHaveLength(1);
    expect(clusters[0].segmentIds.sort()).toEqual(['ab', 'bc', 'ca']);
  });

  it('should NOT merge two segments that only visually cross in raw (unplanarized) node coordinates — no crossing detection here', () => {
    // mock — a horizontal and a vertical segment that geometrically cross at (5,5), sharing no vertex;
    // getVectorNodeClusters (planar) would merge these via a shared virtual crossing vertex, but raw
    // clustering has no such vertex to work with, and stroke rendering doesn't need one either
    const node = buildNode(
      [vertex('h1', 0, 5), vertex('h2', 10, 5), vertex('v1', 5, 0), vertex('v2', 5, 10)],
      [seg('h', 'h1', 'h2'), seg('v', 'v1', 'v2')],
    );

    // before
    const clusters = getVectorNodeRawClusters(node);

    // result
    expect(clusters).toHaveLength(2);
  });

  it('should return the same cluster array reference for the same node reference', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('ab', 'a', 'b')]);

    // before
    const first = getVectorNodeRawClusters(node);
    const second = getVectorNodeRawClusters(node);

    // result
    expect(second).toBe(first);
  });
});
