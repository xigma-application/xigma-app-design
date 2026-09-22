// utils
import { getStrokeTrianglePolygons } from '../getStrokeTrianglePolygons';

describe('getStrokeTrianglePolygons', () => {
  it('should group a flat GL triangle vertex array into 3-point polygons', () => {
    // action
    const polygons = getStrokeTrianglePolygons([0, 0, 10, 0, 10, 10, 0, 0, 10, 10, 0, 10]);

    // result
    expect(polygons).toEqual([
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
    ]);
  });

  it('should return an empty array for an empty vertex list', () => {
    expect(getStrokeTrianglePolygons([])).toEqual([]);
  });
});
