// utils
import { getPointDirection } from '../getPointDirection';

const path = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
];

describe('getPointDirection', () => {
  it('should follow the outgoing segment at the start and the incoming one at the end', () => {
    // result
    expect(getPointDirection(path, 0)).toEqual({ x: 1, y: 0 });
    expect(getPointDirection(path, 2)).toEqual({ x: 0, y: 1 });
  });

  it('should average both segments at an inner point', () => {
    // before
    const direction = getPointDirection(path, 1);

    // result
    expect(direction.x).toBeCloseTo(Math.SQRT1_2);
    expect(direction.y).toBeCloseTo(Math.SQRT1_2);
  });

  it('should keep the incoming direction where the path turns straight back', () => {
    // result
    expect(
      getPointDirection(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 0, y: 0 },
        ],
        1,
      ),
    ).toEqual({ x: 1, y: 0 });
  });
});
