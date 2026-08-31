// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getRectangleStrokeOutlineLoops } from '../getRectangleStrokeOutlineLoops';

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

describe('getRectangleStrokeOutlineLoops', () => {
  it('should return both an outer and an inner loop when the stroke leaves an inner hole', () => {
    // action — 20x20 rect, half-width 2 leaves a 16x16 inner rect
    const { inner, outer } = getRectangleStrokeOutlineLoops(buildRectangle(), 2);

    // result
    expect(outer.length).toBeGreaterThan(0);
    expect(inner).not.toBeNull();
  });

  it('should drop the inner loop when the stroke half-width consumes the whole shape', () => {
    // action — half-width 10 on a 20x20 rect: inner width/height collapse to 0
    const { inner } = getRectangleStrokeOutlineLoops(buildRectangle(), 10);

    // result
    expect(inner).toBeNull();
  });

  it('should clamp the corner radius to the shape before offsetting it by the half-width', () => {
    // action — cornerRadius 999 clamps to 10 (half the 20px side); outer radius = 10 + half-width
    const { outer } = getRectangleStrokeOutlineLoops(buildRectangle({ cornerRadius: 999 }), 2);

    // result — a rounded outer ring still produces a closed point loop
    expect(outer.length).toBeGreaterThan(4);
  });
});
