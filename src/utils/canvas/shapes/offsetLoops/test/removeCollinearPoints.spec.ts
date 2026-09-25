// utils
import { removeCollinearPoints } from '../removeCollinearPoints';

describe('removeCollinearPoints', () => {
  it('should drop points in the middle of a straight side and repeated points', () => {
    // result
    expect(
      removeCollinearPoints([
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);
  });

  it('should keep the points where the outline turns back on itself', () => {
    // mock
    const loop = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 0 },
    ];

    // result
    expect(removeCollinearPoints(loop)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });
});
