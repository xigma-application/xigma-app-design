// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { getStrokeColor } from '../getStrokeColor';

const buildRectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
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
  it("should read the color of a line node's stroke paint", () => {
    // mock
    const node: TLineNode = {
      height: 0,
      id: 'l',
      name: 'Line',
      parentId: null,
      rotation: 0,
      strokes: [{ color: '#abcdef', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      width: 1,
      x: 0,
      y: 0,
    };

    // result
    expect(getStrokeColor(node)).toBe('#abcdef');
    expect(getStrokeColor({ ...node, strokes: [] })).toBe('');
  });

  it("should read a non-line node's `strokeColor` field", () => {
    // result
    expect(getStrokeColor(buildRectangle({ strokeColor: '#123456' }))).toBe('#123456');
  });

  it('should fall back to an empty string when a non-line node has no strokeColor', () => {
    // result
    expect(getStrokeColor(buildRectangle())).toBe('');
  });

  it('should read an ellipse stroke from its first visible stroke paint, or nothing without one', () => {
    // mock
    const ellipse = {
      fills: [],
      height: 20,
      id: 'e',
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 20,
      x: 0,
      y: 0,
    } as TEllipseNode;

    // result
    expect(getStrokeColor({ ...ellipse, strokes: [{ color: '#123456', opacity: 100, type: 'solid' }] })).toBe('#123456');
    expect(getStrokeColor(ellipse)).toBe('');
  });
});
