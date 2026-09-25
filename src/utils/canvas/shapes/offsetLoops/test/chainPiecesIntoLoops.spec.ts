// types
import { TPoint } from 'types/canvas';

// utils
import { chainPiecesIntoLoops } from '../chainPiecesIntoLoops';

const a: TPoint = { x: 0, y: 0 };
const b: TPoint = { x: 10, y: 0 };
const c: TPoint = { x: 10, y: 10 };
const d: TPoint = { x: 20, y: 20 };
const e: TPoint = { x: 30, y: 20 };
const f: TPoint = { x: 30, y: 30 };

describe('chainPiecesIntoLoops', () => {
  it('should join pieces end to start into separate loops whatever their order', () => {
    // before
    const loops = chainPiecesIntoLoops([
      { end: c, start: b },
      { end: e, start: d },
      { end: a, start: c },
      { end: f, start: e },
      { end: b, start: a },
      { end: d, start: f },
    ]);

    // result
    expect(loops).toEqual([
      [b, c, a],
      [d, e, f],
    ]);
  });

  it('should close a loop through a point it passes twice', () => {
    // before
    const loops = chainPiecesIntoLoops([
      { end: b, start: a },
      { end: c, start: b },
      { end: a, start: c },
      { end: d, start: a },
      { end: e, start: d },
      { end: a, start: e },
    ]);

    // result
    expect(loops.flat()).toHaveLength(6);
  });

  it('should stop a chain that does not come back to its start', () => {
    // result
    expect(
      chainPiecesIntoLoops([
        { end: b, start: a },
        { end: c, start: b },
      ]),
    ).toEqual([[a, b]]);
  });
});
