// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { findHoverInNode } from '../findHoverInNode';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  defaultFill: null,
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
  vertices: { v1: { id: 'v1', x: 0, y: 0 } },
};

describe('findHoverInNode', () => {
  it('should return the resolver match when hovering near a vertex on the node', () => {
    // before
    const result = findHoverInNode(node, { x: 1, y: 0 }, IDENTITY_VIEWPORT);

    // result
    expect(result).toMatchObject({ hoverKind: 'vertex', point: { id: 'v1', x: 0, y: 0 } });
  });

  it("should report the excluded vertex as an 'active-vertex' hover, not a plain vertex hover, when hovering on it", () => {
    // before — v1 is both the only vertex on the node and the excluded (active) vertex
    const result = findHoverInNode(node, { x: 0, y: 0 }, IDENTITY_VIEWPORT, 'v1');

    // result
    expect(result).toMatchObject({ hoverKind: 'active-vertex' });
  });

  it('should return undefined when nothing on the node is within tolerance', () => {
    // before
    const result = findHoverInNode(node, { x: 5000, y: 5000 }, IDENTITY_VIEWPORT);

    // result
    expect(result).toBeUndefined();
  });
});
