// utils
import { buildAutoLayoutGapRect } from '../buildAutoLayoutGapRect';

describe('buildAutoLayoutGapRect', () => {
  it('should build a horizontal-flow rect spanning the primary range on x and the band on y', () => {
    const rect = buildAutoLayoutGapRect('x', 50, 70, 0, 50);

    expect(rect).toEqual({ height: 50, width: 20, x: 50, y: 0 });
  });

  it('should build a vertical-flow rect spanning the primary range on y and the band on x', () => {
    const rect = buildAutoLayoutGapRect('y', 50, 70, 0, 50);

    expect(rect).toEqual({ height: 20, width: 50, x: 0, y: 50 });
  });
});
