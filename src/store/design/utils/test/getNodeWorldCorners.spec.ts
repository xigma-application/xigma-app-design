// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { getNodeWorldCorners } from '../getNodeWorldCorners';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const rect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'r',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getNodeWorldCorners', () => {
  it('should return the four plain corners of an unrotated box node', () => {
    // result
    expect(getNodeWorldCorners(rect({ height: 20, width: 10, x: 0, y: 0 }))).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 20 },
      { x: 0, y: 20 },
    ]);
  });

  it('should rotate the corners around the node’s own center', () => {
    // mock — a 10x10 square at the origin rotated 90° around its own center (5,5)
    const corners = getNodeWorldCorners(rect({ height: 10, rotation: 90, width: 10, x: 0, y: 0 }));

    // result — a 90° rotation of a square around its own center maps corners onto each other
    expect(corners[0].x).toBeCloseTo(10, 5);
    expect(corners[0].y).toBeCloseTo(0, 5);
  });

  it("should return a line's turned box, whose corners fall on its endpoints", () => {
    // mock
    const line: TLineNode = {
      id: 'l',
      name: 'Line',
      parentId: null,
      strokes: [{ color: '#fff', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      ...getLineBoxFromPoints({ x1: 0, x2: 10, y1: 0, y2: 10 }),
    };

    // result
    const corners = getNodeWorldCorners(line);

    expect(corners[0]).toEqual({ x: expect.closeTo(0), y: expect.closeTo(0) });
    expect(corners[1]).toEqual({ x: expect.closeTo(10), y: expect.closeTo(10) });
    expect(corners[2]).toEqual({ x: expect.closeTo(10), y: expect.closeTo(10) });
    expect(corners[3]).toEqual({ x: expect.closeTo(0), y: expect.closeTo(0) });
  });

  it('should return the corners of the drawn shape of a rotated vector', () => {
    // mock — a 100x100 square turned 45° spans about 141 around its own center (50,50)
    const corners = getNodeWorldCorners(makeSquareVector({ rotation: 45 }));

    // result
    expect(corners[0].x).toBeCloseTo(50 - 50 * Math.SQRT2, 5);
    expect(corners[2].y).toBeCloseTo(50 + 50 * Math.SQRT2, 5);
  });
});
