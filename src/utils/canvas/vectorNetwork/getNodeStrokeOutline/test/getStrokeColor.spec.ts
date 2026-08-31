// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { getStrokeColor } from '../getStrokeColor';

const buildRectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#ffffff',
  height: 20,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getStrokeColor', () => {
  it("should read a line node's own `stroke` field", () => {
    // mock
    const node: TLineNode = { id: 'l', name: 'Line', parentId: null, stroke: '#abcdef', type: NodeType.line, x1: 0, x2: 1, y1: 0, y2: 0 };

    // result
    expect(getStrokeColor(node)).toBe('#abcdef');
  });

  it("should read a non-line node's `strokeColor` field", () => {
    // result
    expect(getStrokeColor(buildRectangle({ strokeColor: '#123456' }))).toBe('#123456');
  });

  it('should fall back to an empty string when a non-line node has no strokeColor', () => {
    // result
    expect(getStrokeColor(buildRectangle())).toBe('');
  });
});
