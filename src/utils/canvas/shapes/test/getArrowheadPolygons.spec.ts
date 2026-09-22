// utils
import { getArrowheadPolygons } from '../getArrowheadPolygons';

describe('getArrowheadPolygons', () => {
  it('should return two wing quads and three round joint circles', () => {
    // action
    const polygons = getArrowheadPolygons({ x: 10, y: 0 }, { x: 1, y: 0 }, 6, 1);

    // result
    expect(polygons).toHaveLength(5);
    expect(polygons[0]).toHaveLength(4);
    expect(polygons[1]).toHaveLength(4);
    expect(polygons[2].length).toBeGreaterThan(4);
    expect(polygons[3].length).toBeGreaterThan(4);
    expect(polygons[4].length).toBeGreaterThan(4);
  });

  it('should center the tip joint circle on the tip point', () => {
    // action
    const [, , tipCircle] = getArrowheadPolygons({ x: 10, y: 5 }, { x: 1, y: 0 }, 6, 2);
    const xs = tipCircle.map((point) => point.x);
    const ys = tipCircle.map((point) => point.y);

    // result
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(10);
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(5);
  });
});
