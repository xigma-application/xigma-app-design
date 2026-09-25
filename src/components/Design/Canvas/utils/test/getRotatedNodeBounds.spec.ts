// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { getRotatedNodeBounds } from '../getRotatedNodeBounds';

describe('getRotatedNodeBounds', () => {
  it('should return the raw bounds unchanged when rotation is 0', () => {
    // mock
    const rectangle: TRectangleNode = {
      fills: [{ color: '#000', opacity: 100, type: 'solid' }],
      height: 10,
      id: '1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 5,
      y: 5,
    };

    // result
    expect(getRotatedNodeBounds(rectangle)).toEqual({ height: 10, width: 20, x: 5, y: 5 });
  });

  it('should return a wider axis-aligned bounding box for a rotated square', () => {
    // mock
    const square: TRectangleNode = {
      fills: [{ color: '#000', opacity: 100, type: 'solid' }],
      height: 10,
      id: '1',
      name: 'Square',
      parentId: null,
      rotation: 45,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    };

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
    const rectangle: TRectangleNode = {
      fills: [{ color: '#000', opacity: 100, type: 'solid' }],
      height: 10,
      id: '1',
      name: 'Rectangle',
      parentId: null,
      rotation: 90,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    };

    // result — center (10, 5) stays put; the bbox now has the width/height swapped
    const bounds = getRotatedNodeBounds(rectangle);

    expect(bounds.width).toBeCloseTo(10);
    expect(bounds.height).toBeCloseTo(20);
    expect(bounds.x).toBeCloseTo(5);
    expect(bounds.y).toBeCloseTo(-5);
  });

  it('should cover both endpoints of a turned line', () => {
    // mock
    const line: TLineNode = {
      id: '1',
      name: 'Line',
      parentId: null,
      strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      ...getLineBoxFromPoints({ x1: 0, x2: 10, y1: 0, y2: 20 }),
    };

    // result
    expect(getRotatedNodeBounds(line)).toEqual({
      height: expect.closeTo(20),
      width: expect.closeTo(10),
      x: expect.closeTo(0),
      y: expect.closeTo(0),
    });
  });
});
