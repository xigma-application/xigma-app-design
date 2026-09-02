// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { isPointInVectorRegions } from '../isPointInVectorRegions';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

const triangle = buildNode(
  {
    ab: { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
    bc: { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
    ca: { endId: 'a', id: 'ca', startId: 'c', tangentEnd: null, tangentStart: null },
  },
  { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 0, y: 10 } },
);

const filledTriangle: TVectorNode = { ...triangle, filledFaceKeys: [getVectorFillLoopKey(deriveVectorFaces(triangle)[0].pieceKeys)] };

describe('isPointInVectorRegions', () => {
  it('should return false for a point inside a closed but unfilled region', () => {
    // result — an unfilled region only collides on its contour, not its interior
    expect(isPointInVectorRegions({ x: 2, y: 2 }, triangle)).toBe(false);
  });

  it('should return true for a point inside a filled region', () => {
    // result
    expect(isPointInVectorRegions({ x: 2, y: 2 }, filledTriangle)).toBe(true);
  });

  it('should return false for a point outside every filled region', () => {
    // result
    expect(isPointInVectorRegions({ x: 20, y: 20 }, filledTriangle)).toBe(false);
  });

  it('should always return false for a node with no closed regions (an open path)', () => {
    // mock
    const open = buildNode(
      { ab: { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } },
    );

    // result — even a point sitting right on the open segment itself is not "inside" anything
    expect(isPointInVectorRegions({ x: 5, y: 0 }, open)).toBe(false);
  });
});
