// utils
import { formatSvgNumber } from '../formatSvgNumber';

describe('formatSvgNumber', () => {
  it('should round to 6 decimal places', () => {
    expect(formatSvgNumber(1 / 3)).toBe('0.333333');
  });

  it('should format whole numbers without a trailing decimal', () => {
    expect(formatSvgNumber(2)).toBe('2');
  });

  it('should return 0 for non-finite values', () => {
    expect(formatSvgNumber(NaN)).toBe('0');
    expect(formatSvgNumber(Infinity)).toBe('0');
  });
});
