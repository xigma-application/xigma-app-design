// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getTarget } from '../getTarget';

const node: TVectorNode = {
  defaultFill: null,
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

// a closed triangle, elsewhere, so deriveVectorFaces has a real face to find
const closedNode: TVectorNode = {
  ...node,
  id: 'vector-2',
  segments: {
    fs1: { endId: 'fv2', id: 'fs1', startId: 'fv1', tangentEnd: null, tangentStart: null },
    fs2: { endId: 'fv3', id: 'fs2', startId: 'fv2', tangentEnd: null, tangentStart: null },
    fs3: { endId: 'fv1', id: 'fs3', startId: 'fv3', tangentEnd: null, tangentStart: null },
  },
  vertices: { fv1: { id: 'fv1', x: 500, y: 500 }, fv2: { id: 'fv2', x: 600, y: 500 }, fv3: { id: 'fv3', x: 550, y: 550 } },
};
const [closedFace] = deriveVectorFaces(closedNode);

describe('getTarget', () => {
  it('should target a hovered vertex that is not excluded, at its own position', () => {
    expect(getTarget([node], ['v1'], 'v3', null, null, { x: 0, y: 0 }, { x: 0, y: 0 })).toEqual({
      kind: 'point',
      point: { id: 'v3', x: 100, y: 100 },
    });
  });

  it('should return null when the only hovered vertex is excluded', () => {
    expect(getTarget([node], ['v1'], 'v1', null, null, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeNull();
  });

  it('should return null when the hovered vertex is excluded as part of a multi-vertex (box) anchor', () => {
    expect(getTarget([node], ['v1', 'v2'], 'v2', null, null, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeNull();
  });

  it('should return null when the hovered vertex is in none of the nodes', () => {
    expect(getTarget([node], ['v1'], 'ghost', null, null, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeNull();
  });

  it('should snap to the point on a hovered non-excluded segment nearest the cursor', () => {
    expect(getTarget([node], ['v1'], null, 's2', null, { x: 150, y: 30 }, { x: 0, y: 0 })).toEqual({
      kind: 'point',
      point: { x: 100, y: 30 },
    });
  });

  it('should ride along the segment as the cursor moves, tracking a different point', () => {
    expect(getTarget([node], ['v1'], null, 's2', null, { x: 150, y: 80 }, { x: 0, y: 0 })).toEqual({
      kind: 'point',
      point: { x: 100, y: 80 },
    });
  });

  it('should still ride along a hovered segment that touches the excluded (anchor) vertex — only the vertex itself is off-limits', () => {
    // s1 runs from the excluded v1 to v2; riding it away from v1 is a real, growing distance
    expect(getTarget([node], ['v1'], null, 's1', null, { x: 50, y: 10 }, { x: 0, y: 0 })).toEqual({
      kind: 'point',
      point: { x: 50, y: 0 },
    });
  });

  it('should ride along a segment touching a vertex excluded as part of a box anchor, the same way', () => {
    expect(getTarget([node], ['v1', 'v3'], null, 's2', null, { x: 150, y: 50 }, { x: 0, y: 0 })).toEqual({
      kind: 'point',
      point: { x: 100, y: 50 },
    });
  });

  it('should return null when the hovered segment is in none of the nodes', () => {
    expect(getTarget([node], ['v1'], null, 'ghost', null, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeNull();
  });

  it('should target the point on a hovered face’s own outline nearest the anchor, not a corner of its bounding box', () => {
    // the triangle's top edge (fv1 500,500 -> fv2 600,500) is the closest part of its outline to a
    // point sitting above it — the bbox's own top-left corner (500,500) coincides here, but so a
    // hovering point off-center (550, 400) proves it's a real point-on-outline projection, not a
    // fixed corner: the nearest point is (550, 500), the midpoint of that edge, not any bbox corner
    expect(
      getTarget([closedNode], [], null, null, { faceKey: closedFace.key, nodeId: 'vector-2' }, { x: 0, y: 0 }, { x: 550, y: 400 }),
    ).toEqual({
      kind: 'point',
      point: { x: 550, y: 500 },
    });
  });

  it('should return null when the hovered face resolves to no node', () => {
    expect(
      getTarget([closedNode], [], null, null, { faceKey: closedFace.key, nodeId: 'ghost' }, { x: 0, y: 0 }, { x: 0, y: 0 }),
    ).toBeNull();
  });

  it('should return null when the hovered face key is in none of the node’s derived faces', () => {
    expect(getTarget([closedNode], [], null, null, { faceKey: 'ghost', nodeId: 'vector-2' }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeNull();
  });

  it('should return null when nothing is hovered', () => {
    expect(getTarget([node], ['v1'], null, null, null, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeNull();
  });
});
