// types
import { LineEndpoint, NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { getLineStrokePolygon } from '../getLineStrokePolygon';

const line: TLineNode = {
  height: 0,
  id: 'l',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
};

describe('getLineStrokePolygon', () => {
  it('should outline a line without a stroke width at the 1px default', () => {
    // result
    expect(getLineStrokePolygon(line)).toEqual([
      { x: 0, y: 0.5 },
      { x: 100, y: 0.5 },
      { x: 100, y: -0.5 },
      { x: 0, y: -0.5 },
    ]);
  });

  it('should use the stroke width and wrap the endpoints', () => {
    // before
    const polygon = getLineStrokePolygon({ ...line, endPoint: LineEndpoint.square, strokeWidth: 4 }) ?? [];

    // result
    expect(Math.max(...polygon.map(({ x }) => x))).toBe(102);
    expect(Math.max(...polygon.map(({ y }) => y))).toBe(2);
  });

  it('should reuse the polygon for the same line and return null for a zero-length one', () => {
    // mock
    const zeroLength = { ...line, width: 0 };

    // result
    expect(getLineStrokePolygon(line)).toBe(getLineStrokePolygon(line));
    expect(getLineStrokePolygon(zeroLength)).toBeNull();
    expect(getLineStrokePolygon(zeroLength)).toBeNull();
  });
});
