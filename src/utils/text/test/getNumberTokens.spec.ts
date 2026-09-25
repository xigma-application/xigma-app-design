// utils
import { getNumberTokens } from '../getNumberTokens';

describe('getNumberTokens', () => {
  it('should find every integer, decimal and negative number with its position', () => {
    // result
    expect(getNumberTokens('w 12, x -3.5')).toEqual([
      { end: 4, start: 2, value: 12 },
      { end: 12, start: 8, value: -3.5 },
    ]);
  });

  it('should find nothing in text without numbers', () => {
    // result
    expect(getNumberTokens('none')).toEqual([]);
  });
});
