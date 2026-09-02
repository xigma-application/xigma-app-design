// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getClustersForStroke } from '../getClustersForStroke';

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });
const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });

const buildNode = (vertices: TVectorVertex[], segments: TVectorSegment[]): TVectorNode => ({
  defaultFill: null,
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

describe('getClustersForStroke', () => {
  it('should use the planar clusters when the planar network reuses the node’s own segments/vertices verbatim (no crossings)', () => {
    const node = buildNode([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('ab', 'a', 'b')]);
    const planar = { segments: node.segments, vertices: node.vertices };

    const clusters = getClustersForStroke(node, planar);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].segmentIds).toEqual(['ab']);
  });

  it('should fall back to raw node clustering when the planar network was rebuilt (a genuine crossing was found)', () => {
    // mock — a horizontal and a vertical segment genuinely crossing at (5,5), sharing no vertex
    const node = buildNode(
      [vertex('h1', 0, 5), vertex('h2', 10, 5), vertex('v1', 5, 0), vertex('v2', 5, 10)],
      [seg('h', 'h1', 'h2'), seg('v', 'v1', 'v2')],
    );
    const planar = { segments: { ...node.segments }, vertices: { ...node.vertices } };

    const clusters = getClustersForStroke(node, planar);

    // result — raw clustering keeps the two segments in separate clusters (no shared vertex), unlike
    // planar clustering, which would merge them across the virtual crossing vertex
    expect(clusters).toHaveLength(2);
  });
});
