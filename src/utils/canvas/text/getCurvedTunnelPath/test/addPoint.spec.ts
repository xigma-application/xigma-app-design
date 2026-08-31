// utils
import { addPoint } from '../addPoint';

describe('addPoint', () => {
  it('should add a point and an offset component-wise', () => {
    // result
    expect(addPoint({ x: 10, y: -4 }, { x: -2, y: 6 })).toEqual({ x: 8, y: 2 });
  });
});
