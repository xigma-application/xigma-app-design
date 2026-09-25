// utils
import { trimPolyline } from '../trimPolyline';

describe('trimPolyline', () => {
  it('should cut a length off both ends, keeping the bends in between', () => {
    // result
    expect(
      trimPolyline(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
        2,
        3,
      ),
    ).toEqual([
      { x: 2, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 7 },
    ]);
  });

  it('should not repeat a point where a cut lands on a bend', () => {
    // result
    expect(
      trimPolyline(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 20, y: 0 },
        ],
        10,
        10,
      ),
    ).toEqual([{ x: 10, y: 0 }]);
  });
});
