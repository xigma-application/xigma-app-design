// utils
import { rotateLineNodeOrigin } from '../rotateLineNodeOrigin';

describe('rotateLineNodeOrigin', () => {
  it('should rotate both endpoints around the pivot and round the result', () => {
    // mock — a vertical line whose own center (100, 50) is the pivot
    const origin = { x1: 100, x2: 100, y1: 0, y2: 100 };

    // before — a 90deg delta turns the vertical line horizontal
    const changes = rotateLineNodeOrigin(origin, { x: 100, y: 50 }, 90);

    // result
    expect(changes.x1).toBeCloseTo(150);
    expect(changes.y1).toBeCloseTo(50);
    expect(changes.x2).toBeCloseTo(50);
    expect(changes.y2).toBeCloseTo(50);
  });
});
