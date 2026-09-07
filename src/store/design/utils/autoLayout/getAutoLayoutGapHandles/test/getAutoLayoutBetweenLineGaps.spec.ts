// utils
import { getAutoLayoutBetweenLineGaps } from '../getAutoLayoutBetweenLineGaps';

const rect = (x: number, y: number): { height: number; width: number; x: number; y: number } => ({ height: 50, width: 50, x, y });

describe('getAutoLayoutBetweenLineGaps', () => {
  it('should build one gap rect spanning the combined width of both lines', () => {
    const gaps = getAutoLayoutBetweenLineGaps([[rect(0, 0), rect(70, 0)], [rect(0, 70)]], 'x');

    expect(gaps).toEqual([{ height: 20, width: 120, x: 0, y: 50 }]);
  });

  it('should build no gaps for a single line', () => {
    const gaps = getAutoLayoutBetweenLineGaps([[rect(0, 0)]], 'x');

    expect(gaps).toEqual([]);
  });
});
