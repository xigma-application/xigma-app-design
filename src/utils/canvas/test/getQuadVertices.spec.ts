// utils
import { getQuadVertices } from '../getQuadVertices';

describe('getQuadVertices', () => {
  it('should split the quad into two triangles sharing the (x1, y1)-(x3, y3) diagonal', () => {
    // result
    expect(getQuadVertices(0, 0, 10, 0, 10, 10, 0, 10)).toEqual([0, 0, 10, 0, 10, 10, 0, 0, 10, 10, 0, 10]);
  });

  it('should return 12 flat numbers (6 vertices) for any quad', () => {
    // result
    expect(getQuadVertices(1, 2, 3, 4, 5, 6, 7, 8)).toHaveLength(12);
  });
});
