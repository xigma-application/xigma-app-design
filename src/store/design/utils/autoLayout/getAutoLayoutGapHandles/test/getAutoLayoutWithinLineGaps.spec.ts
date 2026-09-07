// utils
import { getAutoLayoutWithinLineGaps } from '../getAutoLayoutWithinLineGaps';

const rect = (x: number, y: number): { height: number; width: number; x: number; y: number } => ({ height: 50, width: 50, x, y });

describe('getAutoLayoutWithinLineGaps', () => {
  it('should build one gap rect between two consecutive bounds in a single line', () => {
    const gaps = getAutoLayoutWithinLineGaps([[rect(0, 0), rect(70, 0)]], 'x');

    expect(gaps).toEqual([{ height: 50, width: 20, x: 50, y: 0 }]);
  });

  it('should build a gap for each consecutive pair, across three bounds', () => {
    const gaps = getAutoLayoutWithinLineGaps([[rect(0, 0), rect(70, 0), rect(140, 0)]], 'x');

    expect(gaps).toEqual([
      { height: 50, width: 20, x: 50, y: 0 },
      { height: 50, width: 20, x: 120, y: 0 },
    ]);
  });

  it('should build no gaps for a line with a single bound', () => {
    const gaps = getAutoLayoutWithinLineGaps([[rect(0, 0)]], 'x');

    expect(gaps).toEqual([]);
  });
});
