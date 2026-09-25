// utils
import { getPolylineLength } from '../getPolylineLength';

describe('getPolylineLength', () => {
  it('should add up the length of every segment', () => {
    // result
    expect(
      getPolylineLength([
        { x: 0, y: 0 },
        { x: 3, y: 4 },
        { x: 3, y: 10 },
      ]),
    ).toBe(11);
  });
});
