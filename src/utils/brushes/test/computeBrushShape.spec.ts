// utils
import { computeBrushShape } from '../computeBrushShape';
import { createAlpha, straightBand } from './brushFixtures';

describe('computeBrushShape', () => {
  it('should trace the contours of a brush band and measure its scatter', () => {
    // before
    const shape = computeBrushShape(straightBand);

    // result
    expect(shape?.contours).toHaveLength(1);
    expect(shape?.scatter.coverage).toBeGreaterThan(0);
  });

  it('should return nothing for a fully transparent image', () => {
    // result
    expect(computeBrushShape(createAlpha(20, 20, () => false))).toBeNull();
  });
});
