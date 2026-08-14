// utils
import { getResizeAnchorSolver } from '../getResizeAnchorSolver';

describe('getResizeAnchorSolver', () => {
  it('should return null when there is no single node origin (a group resize)', () => {
    // mock
    const bounds = { height: 100, width: 100, x: 0, y: 0 };

    // result
    expect(getResizeAnchorSolver(bounds, 'se', 2, 1, null)).toBeNull();
  });

  it('should return null when the single node origin has no rotation', () => {
    // mock
    const bounds = { height: 100, width: 100, x: 0, y: 0 };
    const origin = { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(getResizeAnchorSolver(bounds, 'se', 2, 1, origin)).toBeNull();
  });

  it('should return a working anchor solver for a rotated single node origin', () => {
    // mock
    const bounds = { height: 50, width: 100, x: 0, y: 0 };
    const origin = { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 };

    // before
    const solver = getResizeAnchorSolver(bounds, 'e', 2, 1, origin);
    const result = solver!(200, 50);

    // result
    expect(solver).not.toBeNull();
    expect(result.x).toBeCloseTo(-50);
    expect(result.y).toBeCloseTo(50);
  });
});
