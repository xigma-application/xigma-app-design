// utils
import { translatePolygons } from '../translatePolygons';

describe('translatePolygons', () => {
  it('should move every point of every polygon by the offset', () => {
    // result
    expect(translatePolygons([[{ x: 1, y: 2 }], [{ x: 3, y: 4 }]], { x: 10, y: -1 })).toEqual([[{ x: 11, y: 1 }], [{ x: 13, y: 3 }]]);
  });
});
