// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { getNodeAxisAlignedBounds } from '../getNodeAxisAlignedBounds';

describe('getNodeAxisAlignedBounds', () => {
  it("should return a line's own unturned box, as long as the line", () => {
    // mock
    const line: TLineNode = {
      id: 'l',
      name: 'Line',
      parentId: null,
      strokes: [{ color: '#fff', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      ...getLineBoxFromPoints({ x1: 30, x2: 10, y1: 20, y2: 0 }),
    };

    // result
    expect(getNodeAxisAlignedBounds(line)).toEqual({
      height: expect.closeTo(0),
      width: expect.closeTo(Math.hypot(20, 20)),
      x: expect.closeTo(20 - Math.hypot(20, 20) / 2),
      y: expect.closeTo(10),
    });
  });

  it('should return the vector node’s own bounds for a vector', () => {
    // mock
    const vector: TVectorNode = {
      defaultFill: [{ color: '#fff', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      id: 'v',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeWidth: 1,
      strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 10 } },
    };

    // result
    expect(getNodeAxisAlignedBounds(vector)).toEqual({ height: 10, width: 10, x: 0, y: 0 });
  });

  it('should return a box node’s own x/y/width/height as-is', () => {
    // mock
    const rect: TRectangleNode = {
      fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
      height: 30,
      id: 'r',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 5,
      y: 15,
    };

    // result
    expect(getNodeAxisAlignedBounds(rect)).toEqual({ height: 30, width: 20, x: 5, y: 15 });
  });
});
