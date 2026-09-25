// types
import { LineEndpoint, NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { getLineStrokeOutlineLoops } from '../getLineStrokeOutlineLoops';

const buildLine = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  height: 0,
  id: 'line-1',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getLineStrokeOutlineLoops', () => {
  it('should return a hole-less 4-point band offset either side of the segment', () => {
    // action — horizontal segment, half-width 2
    const loops = getLineStrokeOutlineLoops(buildLine(), 2);

    // result
    expect(loops?.inner).toBeNull();
    expect(loops?.outer).toEqual([
      { x: 0, y: 2 },
      { x: 100, y: 2 },
      { x: 100, y: -2 },
      { x: 0, y: -2 },
    ]);
  });

  it('should return null for a zero-length segment (no direction to offset along)', () => {
    // action
    const loops = getLineStrokeOutlineLoops(buildLine({ width: 0 }), 2);

    // result
    expect(loops).toBeNull();
  });

  it('should grow the outline around an arrowhead at the end and at the start', () => {
    // before
    const loops = getLineStrokeOutlineLoops(buildLine({ endPoint: LineEndpoint.lineArrow, startPoint: LineEndpoint.lineArrow }), 0.5);

    // result
    const xs = loops?.outer.map((point) => point.x) ?? [];
    const ys = loops?.outer.map((point) => point.y) ?? [];

    expect(loops?.outer).toHaveLength(14);
    expect(Math.max(...xs)).toBeGreaterThan(100);
    expect(Math.min(...xs)).toBeLessThan(0);
    expect(Math.max(...ys)).toBeGreaterThan(3);
    expect(Math.min(...ys)).toBeLessThan(-3);
  });
});
