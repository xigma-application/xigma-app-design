// utils
import { groupAutoLayoutGapBoundsIntoLines } from '../groupAutoLayoutGapBoundsIntoLines';

const rect = (x: number, y: number): { height: number; width: number; x: number; y: number } => ({ height: 50, width: 50, x, y });

describe('groupAutoLayoutGapBoundsIntoLines', () => {
  it('should keep every bound in one line when the primary axis keeps increasing', () => {
    const lines = groupAutoLayoutGapBoundsIntoLines([rect(0, 0), rect(70, 0), rect(140, 0)], 'x');

    expect(lines).toEqual([[rect(0, 0), rect(70, 0), rect(140, 0)]]);
  });

  it('should start a new line once the primary axis resets (wraps)', () => {
    const lines = groupAutoLayoutGapBoundsIntoLines([rect(0, 0), rect(70, 0), rect(0, 70)], 'x');

    expect(lines).toEqual([[rect(0, 0), rect(70, 0)], [rect(0, 70)]]);
  });

  it('should return a single line with all bounds passed in, for a lone bound', () => {
    const lines = groupAutoLayoutGapBoundsIntoLines([rect(0, 0)], 'x');

    expect(lines).toEqual([[rect(0, 0)]]);
  });
});
