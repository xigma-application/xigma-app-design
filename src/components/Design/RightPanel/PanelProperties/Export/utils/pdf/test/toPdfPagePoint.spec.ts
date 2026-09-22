// utils
import { toPdfPagePoint } from '../toPdfPagePoint';

describe('toPdfPagePoint', () => {
  it('should translate by the bounds origin and flip the y axis', () => {
    // action
    const point = toPdfPagePoint({ x: 30, y: 40 }, { height: 100, width: 100, x: 10, y: 20 });

    // result
    expect(point).toEqual({ x: 20, y: 80 });
  });
});
