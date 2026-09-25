// types
import { TPoint } from 'types/canvas';

// utils
import { getOffsetLoops } from '../getOffsetLoops';
import { getStarPoints } from '../../getStarPoints';
import { getVectorFaceSignedArea } from '../../../vectorNetwork/getVectorFaceSignedArea';

const square: TPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const countSelfCrossings = (loop: TPoint[]): number => {
  const side = (a: TPoint, b: TPoint, c: TPoint): number => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

  return loop.reduce((count, a, i) => {
    const b = loop[(i + 1) % loop.length];

    return (
      count +
      loop.filter((c, j) => {
        const d = loop[(j + 1) % loop.length];
        const isNeighbour = j <= i + 1 || (i === 0 && j === loop.length - 1);

        return !isNeighbour && side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
      }).length
    );
  }, 0);
};

describe('getOffsetLoops', () => {
  it('should grow and shrink a square keeping its direction', () => {
    // result
    expect(getOffsetLoops(square, 10)).toEqual([
      [
        { x: -10, y: -10 },
        { x: 110, y: -10 },
        { x: 110, y: 110 },
        { x: -10, y: 110 },
      ],
    ]);
    expect(getOffsetLoops([...square].reverse(), -10)[0]).toEqual([
      { x: 10, y: 90 },
      { x: 90, y: 90 },
      { x: 90, y: 10 },
      { x: 10, y: 10 },
    ]);
  });

  it('should give nothing once the shape shrinks away or is too small', () => {
    // result
    expect(getOffsetLoops(square, -60)).toEqual([]);
    expect(
      getOffsetLoops(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        5,
      ),
    ).toEqual([]);
  });

  it('should shrink a many-pointed star into one clean outline whose spikes vanish once they are too thin', () => {
    // mock
    const star = getStarPoints({ height: 400, width: 470, x: 0, y: 0 }, 24, 0.382);

    // before
    const thin = getOffsetLoops(star, -2);
    const thick = getOffsetLoops(star, -40);

    // result
    expect(thin).toHaveLength(1);
    expect(thick).toHaveLength(1);
    expect(countSelfCrossings(thin[0])).toBe(0);
    expect(countSelfCrossings(thick[0])).toBe(0);
    expect(thick[0]).toHaveLength(24);
    expect(Math.abs(getVectorFaceSignedArea(thick[0]))).toBeLessThan(Math.abs(getVectorFaceSignedArea(thin[0])));
  });

  it('should grow a many-pointed star into one clean outline', () => {
    // mock
    const star = getStarPoints({ height: 400, width: 470, x: 0, y: 0 }, 24, 0.382);

    // before
    const loops = getOffsetLoops(star, 20);

    // result
    expect(loops).toHaveLength(1);
    expect(countSelfCrossings(loops[0])).toBe(0);
  });
});
