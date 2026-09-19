// utils
import { traceBrushContours } from '../traceBrushContours';
import { createStrip } from './stripFixtures';

describe('traceBrushContours', () => {
  it('should trace a block as one loop spanning the strip', () => {
    // action
    const loops = traceBrushContours(createStrip(20, 9, (column, row) => column >= 2 && column <= 17 && row >= 2 && row <= 6));

    // result
    expect(loops).toHaveLength(1);
    expect(Math.min(...loops[0].map((point) => point.u))).toBeLessThan(0.2);
    expect(Math.max(...loops[0].map((point) => point.u))).toBeGreaterThan(0.8);
  });

  it('should drop specks smaller than the minimum area', () => {
    // action
    const loops = traceBrushContours(createStrip(20, 9, (column, row) => column === 5 && row === 4));

    // result
    expect(loops).toEqual([]);
  });

  it('should return nothing for an empty strip', () => {
    // result
    expect(traceBrushContours(createStrip(10, 5, () => false))).toEqual([]);
  });
});
