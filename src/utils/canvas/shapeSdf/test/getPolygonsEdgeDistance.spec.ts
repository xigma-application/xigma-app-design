// utils
import { getPolygonsEdgeDistance } from '../getPolygonsEdgeDistance';

describe('getPolygonsEdgeDistance', () => {
  it('should return the distance to the nearest edge of any polygon, closing each ring', () => {
    // mock
    const triangle = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ];

    // action / result
    expect(getPolygonsEdgeDistance({ x: -2, y: 5 }, [triangle])).toBe(2);
  });

  it('should be infinite without polygons', () => {
    // action / result
    expect(getPolygonsEdgeDistance({ x: 0, y: 0 }, [])).toBe(Infinity);
  });
});
