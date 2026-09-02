// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../deriveVectorFaces/deriveVectorFaces';
import { getInteriorSegmentIds } from '../getInteriorSegmentIds';

// mock — a 100x100 rectangle split in half by a horizontal "divider" segment (e-f), forming a top
// and a bottom face that share exactly that one segment
const splitRectangleNode: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    bottom: { endId: 'd', id: 'bottom', startId: 'c', tangentEnd: null, tangentStart: null },
    divider: { endId: 'f', id: 'divider', startId: 'e', tangentEnd: null, tangentStart: null },
    leftLower: { endId: 'e', id: 'leftLower', startId: 'd', tangentEnd: null, tangentStart: null },
    leftUpper: { endId: 'a', id: 'leftUpper', startId: 'e', tangentEnd: null, tangentStart: null },
    rightLower: { endId: 'c', id: 'rightLower', startId: 'f', tangentEnd: null, tangentStart: null },
    rightUpper: { endId: 'f', id: 'rightUpper', startId: 'b', tangentEnd: null, tangentStart: null },
    top: { endId: 'b', id: 'top', startId: 'a', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
    e: { id: 'e', x: 0, y: 50 },
    f: { id: 'f', x: 100, y: 50 },
  },
};

describe('getInteriorSegmentIds', () => {
  it('should return the divider segment id when both faces it separates are touched', () => {
    // before
    const faces = deriveVectorFaces(splitRectangleNode);

    // action
    const interiorSegmentIds = getInteriorSegmentIds(splitRectangleNode, faces);

    // result
    expect(interiorSegmentIds).toEqual(['divider']);
  });

  it('should return nothing when only one of the two faces is touched', () => {
    // before
    const [firstFace] = deriveVectorFaces(splitRectangleNode);

    // action
    const interiorSegmentIds = getInteriorSegmentIds(splitRectangleNode, [firstFace]);

    // result
    expect(interiorSegmentIds).toEqual([]);
  });

  it('should return nothing when no faces are touched', () => {
    // action
    const interiorSegmentIds = getInteriorSegmentIds(splitRectangleNode, []);

    // result
    expect(interiorSegmentIds).toEqual([]);
  });
});
