// utils
import { flipPoint } from '../flipPoint';

const center = { x: 10, y: 20 };

describe('flipPoint', () => {
  it('should mirror the x coordinate across the center when flipX is true', () => {
    expect(flipPoint({ x: 15, y: 20 }, center, true, false)).toEqual({ x: 5, y: 20 });
  });

  it('should mirror the y coordinate across the center when flipY is true', () => {
    expect(flipPoint({ x: 15, y: 30 }, center, false, true)).toEqual({ x: 15, y: 10 });
  });

  it('should mirror both coordinates when both flags are true', () => {
    expect(flipPoint({ x: 15, y: 30 }, center, true, true)).toEqual({ x: 5, y: 10 });
  });

  it('should leave the point unchanged when neither flag is set', () => {
    expect(flipPoint({ x: 15, y: 30 }, center, false, false)).toEqual({ x: 15, y: 30 });
  });

  it('should leave a point on the center itself unchanged, regardless of flip flags', () => {
    expect(flipPoint(center, center, true, true)).toEqual(center);
  });
});
