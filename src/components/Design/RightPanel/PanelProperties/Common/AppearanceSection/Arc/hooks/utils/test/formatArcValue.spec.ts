// utils
import { formatArcValue } from '../formatArcValue';

describe('formatArcValue', () => {
  it('should round to two decimals and drop trailing zeros before the unit', () => {
    // result
    expect(formatArcValue(97.4444, '%')).toBe('97.44%');
    expect(formatArcValue(30, '°')).toBe('30°');
  });
});
