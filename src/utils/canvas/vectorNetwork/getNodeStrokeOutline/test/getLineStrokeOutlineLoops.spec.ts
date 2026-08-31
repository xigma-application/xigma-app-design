// types
import { NodeType } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

// utils
import { getLineStrokeOutlineLoops } from '../getLineStrokeOutlineLoops';

const buildLine = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 100,
  y1: 0,
  y2: 0,
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
    const loops = getLineStrokeOutlineLoops(buildLine({ x2: 0, y2: 0 }), 2);

    // result
    expect(loops).toBeNull();
  });
});
