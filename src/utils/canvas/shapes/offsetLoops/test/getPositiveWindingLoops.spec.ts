// types
import { TPoint } from 'types/canvas';

// utils
import { getPositiveWindingLoops } from '../getPositiveWindingLoops';

const square: TPoint[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe('getPositiveWindingLoops', () => {
  it('should keep a simple loop that turns the same way and drop one that turns the other way', () => {
    // result
    expect(getPositiveWindingLoops(square, 1)).toEqual([square]);
    expect(getPositiveWindingLoops(square, -1)).toEqual([]);
    expect(getPositiveWindingLoops([...square].reverse(), -1)).toEqual([square]);
  });

  it('should cut the backwards half of a bow tie away', () => {
    // before
    const loops = getPositiveWindingLoops(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
      ],
      1,
    );

    // result
    expect(loops).toHaveLength(1);
    expect(loops[0]).toHaveLength(3);
  });

  it('should keep the other half of a bow tie for a loop that turns the other way, turned to run the positive way', () => {
    // before
    const loops = getPositiveWindingLoops(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
      ],
      -1,
    );

    // result
    expect(loops).toHaveLength(1);
    expect(loops[0]).toHaveLength(3);
    expect(loops[0].every(({ y }) => y >= 5)).toBe(true);
  });
});
