// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from '../getRotatedNodeBounds';

const rect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fill: '#000',
  height: 10,
  id: '1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 5,
  y: 5,
  ...overrides,
});

describe('getRotatedNodeBounds', () => {
  it('should return the raw bounds unchanged when rotation is 0', () => {
    expect(getRotatedNodeBounds(rect({}))).toEqual({ height: 10, width: 20, x: 5, y: 5 });
  });

  it('should return a wider axis-aligned bounding box for a rotated square', () => {
    // mock
    const square = rect({ height: 10, rotation: 45, width: 10, x: 0, y: 0 });

    // result — a 10x10 square rotated 45deg has an axis-aligned bbox of side 10*sqrt(2), centered
    // on the same (5, 5) center
    const bounds = getRotatedNodeBounds(square);
    const expectedSide = 10 * Math.sqrt(2);

    expect(bounds.width).toBeCloseTo(expectedSide);
    expect(bounds.height).toBeCloseTo(expectedSide);
    expect(bounds.x).toBeCloseTo(5 - expectedSide / 2);
    expect(bounds.y).toBeCloseTo(5 - expectedSide / 2);
  });

  it('should swap width and height for a 90deg rotated rectangle', () => {
    // mock
    const rectangle = rect({ rotation: 90, x: 0, y: 0 });

    // result — center (10, 5) stays put; the bbox now has the width/height swapped
    const bounds = getRotatedNodeBounds(rectangle);

    expect(bounds.width).toBeCloseTo(10);
    expect(bounds.height).toBeCloseTo(20);
    expect(bounds.x).toBeCloseTo(5);
    expect(bounds.y).toBeCloseTo(-5);
  });

  it('should ignore rotation for line nodes, which have no rotation field', () => {
    // mock
    const line: TLineNode = { id: '1', name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 20 };

    // result
    expect(getRotatedNodeBounds(line)).toEqual({ height: 20, width: 10, x: 0, y: 0 });
  });

  it('should ignore rotation for vector nodes, whose network is already baked into absolute vertex coordinates', () => {
    // mock
    const vector: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'v',
      name: 'Vector',
      parentId: null,
      rotation: 45,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 12, y: 8 } },
    };

    // result
    expect(getRotatedNodeBounds(vector)).toEqual({ height: 8, width: 12, x: 0, y: 0 });
  });
});
