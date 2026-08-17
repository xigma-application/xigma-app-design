// utils
import { toFanVertices } from '../toFanVertices';

describe('toFanVertices', () => {
  it('should flatten the center followed by every point, closing the loop back to the first point', () => {
    // mock
    const center = { x: 0, y: 0 };
    const points = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    // result
    expect(toFanVertices(center, points)).toEqual([0, 0, 1, 0, 0, 1, -1, 0, 1, 0]);
  });

  it('should still close the loop when there is only a single point', () => {
    // result
    expect(toFanVertices({ x: 5, y: 5 }, [{ x: 10, y: 10 }])).toEqual([5, 5, 10, 10, 10, 10]);
  });
});
