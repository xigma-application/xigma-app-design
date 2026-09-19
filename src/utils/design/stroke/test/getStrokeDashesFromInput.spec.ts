// utils
import { getStrokeDashesFromInput } from '../getStrokeDashesFromInput';

describe('getStrokeDashesFromInput', () => {
  it('should parse a comma or space separated dash, gap, dash, gap list', () => {
    expect(getStrokeDashesFromInput('10, 20, 10, 20, 80, 20, 10, 100')).toEqual([10, 20, 10, 20, 80, 20, 10, 100]);
    expect(getStrokeDashesFromInput('5 15')).toEqual([5, 15]);
  });

  it('should reject text, negatives and an all-zero list', () => {
    expect(getStrokeDashesFromInput('a, b')).toBeUndefined();
    expect(getStrokeDashesFromInput('10, -5')).toBeUndefined();
    expect(getStrokeDashesFromInput('0, 0')).toBeUndefined();
    expect(getStrokeDashesFromInput('')).toBeUndefined();
  });
});
