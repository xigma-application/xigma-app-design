// utils
import { truncateContrastRatio } from '../truncateContrastRatio';

describe('truncateContrastRatio', () => {
  it('should truncate instead of round, so a borderline value never rounds up past a threshold', () => {
    expect(truncateContrastRatio(4.499)).toBe(4.49);
    expect(truncateContrastRatio(4.4999)).toBe(4.49);
  });

  it('should keep an already-exact two-decimal value unchanged', () => {
    expect(truncateContrastRatio(7.69)).toBe(7.69);
  });

  it('should truncate 21 unchanged', () => {
    expect(truncateContrastRatio(21)).toBe(21);
  });
});
