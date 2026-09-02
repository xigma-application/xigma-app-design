// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getTarget } from '../getTarget';

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 100, y: 100 } },
};

describe('getTarget', () => {
  it('should target a hovered vertex that is not excluded, at its own position', () => {
    expect(getTarget([node], ['v1'], 'v3', null, { x: 0, y: 0 })).toEqual({ id: 'v3', x: 100, y: 100 });
  });

  it('should return null when the only hovered vertex is excluded', () => {
    expect(getTarget([node], ['v1'], 'v1', null, { x: 0, y: 0 })).toBeNull();
  });

  it('should return null when the hovered vertex is excluded as part of a multi-vertex (box) anchor', () => {
    expect(getTarget([node], ['v1', 'v2'], 'v2', null, { x: 0, y: 0 })).toBeNull();
  });

  it('should return null when the hovered vertex is in none of the nodes', () => {
    expect(getTarget([node], ['v1'], 'ghost', null, { x: 0, y: 0 })).toBeNull();
  });

  it('should snap to the point on a hovered non-excluded segment nearest the cursor', () => {
    expect(getTarget([node], ['v1'], null, 's2', { x: 150, y: 30 })).toEqual({ x: 100, y: 30 });
  });

  it('should ride along the segment as the cursor moves, tracking a different point', () => {
    expect(getTarget([node], ['v1'], null, 's2', { x: 150, y: 80 })).toEqual({ x: 100, y: 80 });
  });

  it('should still ride along a hovered segment that touches the excluded (anchor) vertex — only the vertex itself is off-limits', () => {
    // s1 runs from the excluded v1 to v2; riding it away from v1 is a real, growing distance
    expect(getTarget([node], ['v1'], null, 's1', { x: 50, y: 10 })).toEqual({ x: 50, y: 0 });
  });

  it('should ride along a segment touching a vertex excluded as part of a box anchor, the same way', () => {
    expect(getTarget([node], ['v1', 'v3'], null, 's2', { x: 150, y: 50 })).toEqual({ x: 100, y: 50 });
  });

  it('should return null when the hovered segment is in none of the nodes', () => {
    expect(getTarget([node], ['v1'], null, 'ghost', { x: 0, y: 0 })).toBeNull();
  });

  it('should return null when nothing is hovered', () => {
    expect(getTarget([node], ['v1'], null, null, { x: 0, y: 0 })).toBeNull();
  });
});
