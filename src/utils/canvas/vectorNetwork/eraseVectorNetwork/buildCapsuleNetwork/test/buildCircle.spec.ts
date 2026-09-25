// utils
import { buildCircle } from '../buildCircle';

describe('buildCircle', () => {
  it('should place sixteen points on the circle around the center', () => {
    // before
    const circle = buildCircle({ x: 3, y: 4 }, 2);

    // result
    expect(circle).toHaveLength(16);
    circle.forEach((point) => expect(Math.hypot(point.x - 3, point.y - 4)).toBeCloseTo(2));
  });
});
