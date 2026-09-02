// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getFaceNearestPoint } from '../getFaceNearestPoint';

// a closed triangle: fv1 (500,500) -> fv2 (600,500) -> fv3 (550,550) -> back to fv1
const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    fs1: { endId: 'fv2', id: 'fs1', startId: 'fv1', tangentEnd: null, tangentStart: null },
    fs2: { endId: 'fv3', id: 'fs2', startId: 'fv2', tangentEnd: null, tangentStart: null },
    fs3: { endId: 'fv1', id: 'fs3', startId: 'fv3', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { fv1: { id: 'fv1', x: 500, y: 500 }, fv2: { id: 'fv2', x: 600, y: 500 }, fv3: { id: 'fv3', x: 550, y: 550 } },
};
const [face] = deriveVectorFaces(node);

describe('getFaceNearestPoint', () => {
  it('should return the point on the face’s own outline nearest an anchor sitting above it — the mid of its top edge, not a bbox corner', () => {
    expect(getFaceNearestPoint([node], 'vector-1', face.key, { x: 550, y: 400 })).toEqual({ x: 550, y: 500 });
  });

  it('should return the mid-edge point on a slanted side when the anchor sits off to that side, following the real outline', () => {
    // near the fv2 (600,500) -> fv3 (550,550) edge's own midpoint (575,525), not a vertex or bbox corner
    expect(getFaceNearestPoint([node], 'vector-1', face.key, { x: 589, y: 539 })).toEqual({ x: 575, y: 525 });
  });

  it('should return null when the node id resolves to no baked node', () => {
    expect(getFaceNearestPoint([node], 'ghost', face.key, { x: 0, y: 0 })).toBeNull();
  });

  it('should return null when the face key is in none of the node’s derived faces', () => {
    expect(getFaceNearestPoint([node], 'vector-1', 'ghost', { x: 0, y: 0 })).toBeNull();
  });
});
