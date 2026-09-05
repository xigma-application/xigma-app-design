// utils
import { pushThrottledPoint } from '../pushThrottledPoint';

describe('pushThrottledPoint', () => {
  it('should ignore a move under the minimum drag distance', () => {
    // mock — 1px move, under the 2px throttle at zoom 1
    const tail = [{ x: 0, y: 0 }];

    // before
    pushThrottledPoint(tail, { x: 1, y: 0 }, 1);

    // result
    expect(tail).toEqual([{ x: 0, y: 0 }]);
  });

  it('should push the point once the move clears the minimum drag distance', () => {
    // mock
    const tail = [{ x: 0, y: 0 }];

    // before
    pushThrottledPoint(tail, { x: 5, y: 0 }, 1);

    // result
    expect(tail).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
  });

  it('should scale the throttle threshold by the current zoom', () => {
    // mock — a 1px move stays under threshold at zoom 1, but at zoom 4 the world-space threshold
    // shrinks enough that the same move clears it
    const tail = [{ x: 0, y: 0 }];

    // before
    pushThrottledPoint(tail, { x: 1, y: 0 }, 4);

    // result
    expect(tail).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
  });
});
