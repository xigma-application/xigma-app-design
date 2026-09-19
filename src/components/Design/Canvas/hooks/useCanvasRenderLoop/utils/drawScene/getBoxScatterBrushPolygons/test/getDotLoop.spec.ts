// utils
import { getDotLoop } from '../getDotLoop';

describe('getDotLoop', () => {
  it('should return a closed hexagon around the dot', () => {
    // action
    const loop = getDotLoop({ radius: 2, x: 10, y: 10 });

    // result
    expect(loop).toHaveLength(7);
    expect(loop[0]).toEqual(loop[6]);
    expect(loop.every((point) => Math.abs(Math.hypot(point.x - 10, point.y - 10) - 2) < 1e-9)).toBe(true);
  });
});
