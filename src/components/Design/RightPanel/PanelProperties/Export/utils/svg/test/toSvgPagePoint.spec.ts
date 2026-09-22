// utils
import { toSvgPagePoint } from '../toSvgPagePoint';

describe('toSvgPagePoint', () => {
  it('should translate by the bounds origin without flipping the y axis', () => {
    // action
    const point = toSvgPagePoint({ x: 30, y: 40 }, { height: 100, width: 100, x: 10, y: 20 });

    // result
    expect(point).toEqual({ x: 20, y: 20 });
  });
});
