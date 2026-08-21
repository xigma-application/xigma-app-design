// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorPointsInPolygon } from '../getVectorPointsInPolygon';

const buildNode = (vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

// a 100x100 square drawn as an open path — the function must treat it as implicitly closed
const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

describe('getVectorPointsInPolygon', () => {
  it('should return every vertex whose point falls inside the polygon, and skip the ones outside', () => {
    // mock
    const node = buildNode({ v1: { id: 'v1', x: 50, y: 50 }, v2: { id: 'v2', x: 500, y: 500 } });

    // before
    const result = getVectorPointsInPolygon(node, square);

    // result
    expect(result).toEqual(['v1']);
  });

  it('should treat the drawn path as implicitly closed, without needing an explicit final point back at the start', () => {
    // mock — a concave "L" shape; (60,60) sits inside the L only if the closing edge (last point back
    // to the first) is honored
    const lShape = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 40 },
      { x: 40, y: 40 },
      { x: 40, y: 100 },
      { x: 0, y: 100 },
    ];
    const node = buildNode({ inside: { id: 'inside', x: 20, y: 20 }, outside: { id: 'outside', x: 70, y: 70 } });

    // before
    const result = getVectorPointsInPolygon(node, lShape);

    // result
    expect(result).toEqual(['inside']);
  });

  it('should return an empty array for a degenerate polygon with fewer than 3 points', () => {
    // mock
    const node = buildNode({ v1: { id: 'v1', x: 10, y: 10 } });

    // before
    const result = getVectorPointsInPolygon(node, [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]);

    // result
    expect(result).toEqual([]);
  });

  it('should return everything empty for a node with no vertices', () => {
    // mock
    const node = buildNode({});

    // before
    const result = getVectorPointsInPolygon(node, square);

    // result
    expect(result).toEqual([]);
  });
});
