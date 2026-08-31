// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { groupFilledFacesByColor } from '../groupFilledFacesByColor';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

const buildFrameNode = (): TVectorNode => ({
  fillColor: '#D9D9D9',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    outerA: { endId: 'outerB', id: 'outerA', startId: 'outerA', tangentEnd: null, tangentStart: null },
    outerB: { endId: 'outerC', id: 'outerB', startId: 'outerB', tangentEnd: null, tangentStart: null },
    outerC: { endId: 'outerD', id: 'outerC', startId: 'outerC', tangentEnd: null, tangentStart: null },
    outerD: { endId: 'outerA', id: 'outerD', startId: 'outerD', tangentEnd: null, tangentStart: null },
    innerA: { endId: 'innerB', id: 'innerA', startId: 'innerA', tangentEnd: null, tangentStart: null },
    innerB: { endId: 'innerC', id: 'innerB', startId: 'innerB', tangentEnd: null, tangentStart: null },
    innerC: { endId: 'innerD', id: 'innerC', startId: 'innerC', tangentEnd: null, tangentStart: null },
    innerD: { endId: 'innerA', id: 'innerD', startId: 'innerD', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    outerA: { id: 'outerA', x: 0, y: 0 },
    outerB: { id: 'outerB', x: 100, y: 0 },
    outerC: { id: 'outerC', x: 100, y: 100 },
    outerD: { id: 'outerD', x: 0, y: 100 },
    innerA: { id: 'innerA', x: 20, y: 20 },
    innerB: { id: 'innerB', x: 80, y: 20 },
    innerC: { id: 'innerC', x: 80, y: 80 },
    innerD: { id: 'innerD', x: 20, y: 80 },
  },
});

const getLargestFaceKey = (node: TVectorNode): string => {
  const largest = deriveVectorFaces(node).reduce((biggest, face) =>
    getPolygonArea(face.points) > getPolygonArea(biggest.points) ? face : biggest,
  );

  return getVectorFillLoopKey(largest.pieceKeys);
};

describe('groupFilledFacesByColor — nested independent loop as a hole', () => {
  it('should cut out an unfilled, strictly-nested independent loop from an enclosing filled face', () => {
    // before
    const node = buildFrameNode();

    node.filledFaceKeys = [getLargestFaceKey(node)];

    const result = groupFilledFacesByColor(node);
    const faces = [...result.values()].flat();

    // result
    expect(faces.length).toBe(2);

    const frameMidpoint = { x: 10, y: 50 };
    const centerPoint = { x: 50, y: 50 };
    // mirrors drawVectorFill's stencil-invert trick: a point is actually visible only when it's
    // covered by an odd number of overlapping same-color face polygons
    const isVisiblyFilled = (point: { x: number; y: number }): boolean =>
      faces.filter((face) => isPointInPolygonVertices(point, face)).length % 2 === 1;

    expect(isVisiblyFilled(frameMidpoint)).toBe(true);
    expect(isVisiblyFilled(centerPoint)).toBe(false);
  });

  it('should keep the whole outer square filled when the smaller square sits next to it instead of nested inside', () => {
    // before
    const node = buildFrameNode();

    node.vertices.innerA = { id: 'innerA', x: 200, y: 20 };
    node.vertices.innerB = { id: 'innerB', x: 260, y: 20 };
    node.vertices.innerC = { id: 'innerC', x: 260, y: 80 };
    node.vertices.innerD = { id: 'innerD', x: 200, y: 80 };
    node.filledFaceKeys = [getLargestFaceKey(node)];

    const result = groupFilledFacesByColor(node);
    const faces = [...result.values()].flat();

    // result — the unrelated small square is not nested inside the outer face, so nothing gets cut out
    expect(faces.length).toBe(1);
    expect(isPointInPolygonVertices({ x: 50, y: 50 }, faces[0])).toBe(true);
  });
});
