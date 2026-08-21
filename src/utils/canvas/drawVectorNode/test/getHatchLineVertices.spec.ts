// utils
import { getHatchLineVertices } from '../getHatchLineVertices';

describe('getHatchLineVertices', () => {
  it('should return one 45deg line segment per step across the bounding box of the given points', () => {
    // before
    const vertices = getHatchLineVertices(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      1,
      10,
    );

    // result — each segment is 4 numbers (x1,y1,x2,y2), and every point lies on the diagonal x - y = offset
    expect(vertices.length % 4).toBe(0);

    for (let index = 0; index < vertices.length; index += 4) {
      const [x1, y1, x2, y2] = vertices.slice(index, index + 4);

      expect(x1 - y1).toBeCloseTo(x2 - y2);
    }
  });

  it('should space lines closer together in world units as zoom increases, to keep screen-space spacing constant', () => {
    // before
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const atZoomOne = getHatchLineVertices(points, 1, 10);
    const atZoomTwo = getHatchLineVertices(points, 2, 10);

    // result
    expect(atZoomTwo.length).toBeGreaterThan(atZoomOne.length);
  });

  it('should return no vertices when the bounding box is empty', () => {
    // before
    const vertices = getHatchLineVertices([], 1, 10);

    // result
    expect(vertices).toEqual([]);
  });
});
