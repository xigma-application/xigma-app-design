// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { classifyVertexDots } from '../classifyVertexDots';

const buildNode = (): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 20, y: 0 } },
});

describe('classifyVertexDots', () => {
  it('should put every unselected, unhovered, non-new vertex into the plain batch', () => {
    const result = classifyVertexDots(buildNode(), new Set(), new Set(), null);

    expect(result.plainVertexCenters).toHaveLength(3);
    expect(result.selectedVertexCenters).toHaveLength(0);
  });

  it('should put a selected vertex into the selected batch', () => {
    const node = buildNode();
    const result = classifyVertexDots(node, new Set(['v1']), new Set(), null);

    expect(result.selectedVertexCenters).toEqual([node.vertices.v1]);
    expect(result.plainVertexCenters).toEqual([node.vertices.v2, node.vertices.v3]);
  });

  it('should exclude a new (cut-marked) vertex from both batches, even when it is also selected', () => {
    const node = buildNode();
    const result = classifyVertexDots(node, new Set(['v1']), new Set(['v1']), null);

    expect(result.selectedVertexCenters).toEqual([]);
    expect(result.plainVertexCenters).toEqual([node.vertices.v2, node.vertices.v3]);
  });

  it('should exclude the hovered vertex from the plain batch when it is not selected', () => {
    const node = buildNode();
    const result = classifyVertexDots(node, new Set(), new Set(), 'v1');

    expect(result.plainVertexCenters).toEqual([node.vertices.v2, node.vertices.v3]);
    expect(result.selectedVertexCenters).toEqual([]);
  });

  it('should still bucket a hovered vertex into the selected batch when it is also selected — selection outranks hover', () => {
    const node = buildNode();
    const result = classifyVertexDots(node, new Set(['v1']), new Set(), 'v1');

    expect(result.selectedVertexCenters).toEqual([node.vertices.v1]);
  });
});
