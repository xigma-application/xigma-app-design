// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../deriveVectorFaces';
import { getExclusiveSegmentIds } from '../getExclusiveSegmentIds';

// mock — a 100x100 rectangle split in half by a horizontal "divider" segment (e-f), forming a top
// and a bottom face that share exactly that one segment
const splitRectangleNode: TVectorNode = {
  fillColor: null,
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

describe('getExclusiveSegmentIds', () => {
  it('should return only the outer-boundary segments of a single touched face, keeping the divider shared with the untouched neighbor', () => {
    // before
    const [topFace] = deriveVectorFaces(splitRectangleNode).filter((face) => face.key === 'divider,leftUpper,rightUpper,top');

    // action
    const exclusiveSegmentIds = getExclusiveSegmentIds(splitRectangleNode, [topFace]);

    // result
    expect(exclusiveSegmentIds.sort()).toEqual(['leftUpper', 'rightUpper', 'top']);
  });

  it('should also include the shared divider when both faces it separates are touched', () => {
    // before
    const faces = deriveVectorFaces(splitRectangleNode);

    // action
    const exclusiveSegmentIds = getExclusiveSegmentIds(splitRectangleNode, faces);

    // result — every segment of the rectangle now borders only touched faces
    expect(exclusiveSegmentIds.sort()).toEqual(['bottom', 'divider', 'leftLower', 'leftUpper', 'rightLower', 'rightUpper', 'top']);
  });

  it('should return nothing when no faces are touched', () => {
    // action
    const exclusiveSegmentIds = getExclusiveSegmentIds(splitRectangleNode, []);

    // result
    expect(exclusiveSegmentIds).toEqual([]);
  });
});
