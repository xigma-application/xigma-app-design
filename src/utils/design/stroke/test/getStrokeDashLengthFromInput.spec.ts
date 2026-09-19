// utils
import { getStrokeDashLengthFromInput } from '../getStrokeDashLengthFromInput';

describe('getStrokeDashLengthFromInput', () => {
  it('should parse a length and round it to two decimals', () => {
    expect(getStrokeDashLengthFromInput('20')).toBe(20);
    expect(getStrokeDashLengthFromInput('3.456')).toBe(3.46);
    expect(getStrokeDashLengthFromInput('0')).toBe(0);
  });

  it('should return undefined for text that is not a number', () => {
    expect(getStrokeDashLengthFromInput('abc')).toBeUndefined();
    expect(getStrokeDashLengthFromInput('')).toBeUndefined();
  });
});
