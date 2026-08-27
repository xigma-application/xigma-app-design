// utils
import { getCentroid } from '../getCentroid';

describe('getCentroid', () => {
  it('should average every point in the list', () => {
    // result
    expect(
      getCentroid([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]),
    ).toEqual({ x: 5, y: 5 });
  });

  it('should return the single point itself for a one-point list', () => {
    // result
    expect(getCentroid([{ x: 3, y: 4 }])).toEqual({ x: 3, y: 4 });
  });
});
