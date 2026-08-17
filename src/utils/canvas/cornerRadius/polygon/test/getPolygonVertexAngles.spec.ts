// utils
import { getPolygonVertexAngles } from '../getPolygonVertexAngles';

describe('getPolygonVertexAngles', () => {
  it('should return 60deg (pi/3) at every vertex of an equilateral triangle', () => {
    // mock
    const vertices = [
      { x: 50, y: 0 },
      { x: 93.301, y: 75 },
      { x: 6.699, y: 75 },
    ];

    // result
    getPolygonVertexAngles(vertices).forEach((angle) => {
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
    getPolygonVertexAngles(vertices).forEach((angle) => {
      expect(angle).toBeCloseTo(Math.PI / 2, 5);
    });
  });
});
