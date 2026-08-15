// utils
import { getCenteredMediaRect } from '../getCenteredMediaRect';

describe('getCenteredMediaRect', () => {
  it('should center the natural-size rect on the given point', () => {
    // action
    const rect = getCenteredMediaRect({ x: 10, y: 10 }, 200, 100);

    // result
    expect(rect).toEqual({ height: 100, width: 200, x: -90, y: -40 });
  });

  it('should center a square image the same way on both axes', () => {
    // action
    const rect = getCenteredMediaRect({ x: 0, y: 0 }, 50, 50);

    // result
    expect(rect).toEqual({ height: 50, width: 50, x: -25, y: -25 });
  });
});
