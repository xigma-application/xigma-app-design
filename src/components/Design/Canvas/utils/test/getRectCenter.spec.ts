// utils
import { getRectCenter } from '../getRectCenter';

describe('getRectCenter', () => {
  it('should return the midpoint of a rect anchored at the origin', () => {
    // result
    expect(getRectCenter({ height: 20, width: 10, x: 0, y: 0 })).toEqual({ x: 5, y: 10 });
  });

  it('should return the midpoint of an offset rect', () => {
    // result
    expect(getRectCenter({ height: 40, width: 20, x: 100, y: 50 })).toEqual({ x: 110, y: 70 });
  });
});
