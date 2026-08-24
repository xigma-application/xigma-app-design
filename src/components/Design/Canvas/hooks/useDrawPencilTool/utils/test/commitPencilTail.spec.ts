// utils
import { commitPencilTail } from '../commitPencilTail';

describe('commitPencilTail', () => {
  it('should append the simplified tail to the committed prefix, dropping the tail duplicate start point', () => {
    // mock — a straight tail simplifies down to just its endpoints; its first point (10,0) duplicates
    // the committed prefix's last point, so it must not be duplicated in the result
    const committed = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const tail = [
      { x: 10, y: 0 },
      { x: 15, y: 0 },
      { x: 20, y: 0 },
    ];

    // result
    expect(commitPencilTail(tail, committed, 1)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ]);
  });

  it('should keep a tail point that bulges past the simplification tolerance', () => {
    // mock — the middle tail point sits 5px off the (10,0)->(20,0) chord, well past a tolerance of 1
    const committed = [{ x: 0, y: 0 }];
    const tail = [
      { x: 0, y: 0 },
      { x: 10, y: 5 },
      { x: 20, y: 0 },
    ];

    // result
    expect(commitPencilTail(tail, committed, 1)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 5 },
      { x: 20, y: 0 },
    ]);
  });

  it('should only simplify the tail, leaving already-committed points untouched even if they would collapse together', () => {
    // mock — the committed prefix has 3 nearly-collinear points that WOULD collapse under this
    // tolerance if re-simplified, proving the committed prefix is never re-processed
    const committed = [
      { x: 0, y: 0 },
      { x: 5, y: 0.1 },
      { x: 10, y: 0 },
    ];
    const tail = [
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ];

    // result
    expect(commitPencilTail(tail, committed, 1)).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0.1 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ]);
  });

  it('should append nothing when the tail has no points beyond the shared boundary point', () => {
    // mock — a single-point tail (just the boundary) has no new points to contribute
    const committed = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const tail = [{ x: 10, y: 0 }];

    // result
    expect(commitPencilTail(tail, committed, 1)).toEqual(committed);
  });
});
