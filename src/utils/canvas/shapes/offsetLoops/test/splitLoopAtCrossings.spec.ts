// utils
import { splitLoopAtCrossings } from '../splitLoopAtCrossings';

describe('splitLoopAtCrossings', () => {
  it('should keep every side of a simple loop whole', () => {
    // result
    expect(
      splitLoopAtCrossings([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ]),
    ).toHaveLength(3);
  });

  it('should cut both crossing sides of a bow tie at the crossing point', () => {
    // before
    const pieces = splitLoopAtCrossings([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ]);

    // result
    expect(pieces).toHaveLength(6);
    expect(pieces.filter(({ end }) => end.x === 5 && end.y === 5)).toHaveLength(2);
    expect(pieces[1].start).toBe(pieces[0].end);
  });

  it('should order several cuts along one side', () => {
    // before
    const pieces = splitLoopAtCrossings([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 10 },
      { x: 20, y: -10 },
      { x: 10, y: -10 },
      { x: 10, y: 10 },
    ]);
    const cutXs = pieces.slice(0, 3).map(({ end }) => Math.round(end.x));

    // result
    expect(cutXs).toEqual([10, 25, 30]);
  });

  it('should cut a side where another corner of the loop touches it', () => {
    // before
    const pieces = splitLoopAtCrossings([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 5, y: 0 },
      { x: 0, y: 10 },
    ]);

    // result
    expect(pieces).toHaveLength(6);
    expect(pieces[0].end).toBe(pieces[4].start);
  });
});
