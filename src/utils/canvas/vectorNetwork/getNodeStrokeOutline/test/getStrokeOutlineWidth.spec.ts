// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { getStrokeOutlineWidth } from '../getStrokeOutlineWidth';

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  strokes: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  x1: 0,
  x2: 100,
  y1: 0,
  y2: 0,
};
const rectangle: TRectangleNode = {
  fills: [],
  height: 20,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
};

describe('getStrokeOutlineWidth', () => {
  it('should give a line without a stroke width the same width the canvas draws it with', () => {
    // result
    expect(getStrokeOutlineWidth(line)).toBe(LINE_RENDER_STROKE_WIDTH);
  });

  it("should keep a line's own stroke width", () => {
    // result
    expect(getStrokeOutlineWidth({ ...line, strokeWidth: 4 })).toBe(4);
  });

  it('should treat a missing stroke width on other shapes as no stroke', () => {
    // result
    expect(getStrokeOutlineWidth(rectangle)).toBe(0);
    expect(getStrokeOutlineWidth({ ...rectangle, strokeWidth: 3 })).toBe(3);
  });
});
