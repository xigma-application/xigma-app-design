// utils
import { formatPostScriptNumber } from '../formatPostScriptNumber';

describe('formatPostScriptNumber', () => {
  it('should round to 6 decimal places', () => {
    expect(formatPostScriptNumber(1 / 3)).toBe('0.333333');
  });

  it('should format whole numbers without a trailing decimal', () => {
    expect(formatPostScriptNumber(2)).toBe('2');
  });

  it('should return 0 for non-finite values', () => {
    expect(formatPostScriptNumber(NaN)).toBe('0');
    expect(formatPostScriptNumber(Infinity)).toBe('0');
  });
});
