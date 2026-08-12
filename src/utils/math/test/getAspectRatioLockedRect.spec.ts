// utils
import { getAspectRatioLockedRect } from '../getAspectRatioLockedRect';

describe('getAspectRatioLockedRect', () => {
  it('should drive the size from the raw width when the drag is proportionally wider than the ratio', () => {
    // result
    expect(getAspectRatioLockedRect({ x: 0, y: 0 }, { x: 100, y: 20 }, 2)).toEqual({ height: 50, width: 100, x: 0, y: 0 });
  });

  it('should drive the size from the raw height when the drag is proportionally taller than the ratio', () => {
    // result
    expect(getAspectRatioLockedRect({ x: 0, y: 0 }, { x: 10, y: 100 }, 2)).toEqual({ height: 100, width: 200, x: 0, y: 0 });
  });

  it('should anchor the origin to the right when dragging left', () => {
    // result
    expect(getAspectRatioLockedRect({ x: 50, y: 0 }, { x: 0, y: 20 }, 2)).toEqual({ height: 25, width: 50, x: 0, y: 0 });
  });

  it('should anchor the origin to the bottom when dragging up', () => {
    // result
    expect(getAspectRatioLockedRect({ x: 0, y: 50 }, { x: 20, y: 0 }, 2)).toEqual({ height: 50, width: 100, x: 0, y: 0 });
  });

  it('should stay well-defined for a purely horizontal drag (zero raw height)', () => {
    // result
    expect(getAspectRatioLockedRect({ x: 0, y: 0 }, { x: 80, y: 0 }, 2)).toEqual({ height: 40, width: 80, x: 0, y: 0 });
  });

  it('should stay well-defined for a purely vertical drag (zero raw width)', () => {
    // result
    expect(getAspectRatioLockedRect({ x: 0, y: 0 }, { x: 0, y: 30 }, 2)).toEqual({ height: 30, width: 60, x: 0, y: 0 });
  });

  it('should collapse to a zero-size rect when there is no movement at all', () => {
    // result
    expect(getAspectRatioLockedRect({ x: 5, y: 5 }, { x: 5, y: 5 }, 2)).toEqual({ height: 0, width: 0, x: 5, y: 5 });
  });
});
