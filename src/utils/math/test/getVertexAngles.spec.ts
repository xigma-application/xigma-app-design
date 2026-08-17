// utils
import { getVertexAngles } from '../getVertexAngles';

describe('getVertexAngles', () => {
  it('should return 60deg (pi/3) at every vertex of an equilateral triangle', () => {
    // mock
    const vertices = [
      { x: 50, y: 0 },
      { x: 93.301, y: 75 },
      { x: 6.699, y: 75 },
    ];

    // result
    getVertexAngles(vertices).forEach((angle) => {
      expect(angle).toBeCloseTo(Math.PI / 3, 2);
    });
  });

  it('should return 90deg (pi/2) at every vertex of a square', () => {
    // mock
    const vertices = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];

    // result
    getVertexAngles(vertices).forEach((angle) => {
      expect(angle).toBeCloseTo(Math.PI / 2, 5);
    });
  });

  it('should return the unsigned local opening angle at a reflex (concave) vertex too, not error or overshoot 180deg', () => {
    // mock — a 5-vertex "notched" shape where (5, 3) is pulled inward, making it reflex relative to
    const vertices = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 5, y: 3 },
      { x: 0, y: 10 },
    ];

    // result
    const angles = getVertexAngles(vertices);

    expect(angles[3]).toBeCloseTo(Math.acos(24 / 74), 10);
    angles.forEach((angle) => {
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThanOrEqual(Math.PI);
    });
  });
});
