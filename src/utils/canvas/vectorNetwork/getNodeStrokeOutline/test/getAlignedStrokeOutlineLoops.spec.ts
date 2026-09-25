// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { getAlignedStrokeOutlineLoops } from '../getAlignedStrokeOutlineLoops';

describe('getAlignedStrokeOutlineLoops', () => {
  it('should give a rectangle stroke an outer and an inner loop placed by its alignment', () => {
    // mock
    const rectangle = {
      fills: [],
      height: 20,
      id: 'r',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      strokeAlign: StrokeAlign.outside,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    } as TRectangleNode;

    // before
    const loops = getAlignedStrokeOutlineLoops(rectangle, 4) ?? [];

    // result
    expect(loops).toHaveLength(2);
    expect(Math.min(...loops[0].map((point) => point.x))).toBe(-4);
  });

  it('should give a line a single loop and nothing for a zero-length one', () => {
    // mock
    const line = {
      height: 0,
      id: 'l',
      name: 'Line',
      parentId: null,
      rotation: 0,
      strokes: [],
      type: NodeType.line,
      width: 10,
      x: 0,
      y: 0,
    } as TLineNode;

    // result
    expect(getAlignedStrokeOutlineLoops(line, 2)).toHaveLength(1);
    expect(getAlignedStrokeOutlineLoops({ ...line, width: 0 }, 2)).toBeNull();
  });
});
