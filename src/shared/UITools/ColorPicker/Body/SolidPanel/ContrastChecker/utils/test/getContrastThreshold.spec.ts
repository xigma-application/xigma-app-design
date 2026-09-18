// types
import { ContrastCategory, ContrastLevel } from '../../enums';

// utils
import { getContrastThreshold } from '../getContrastThreshold';

describe('getContrastThreshold', () => {
  it('should return 4.5 for normal text at AA', () => {
    expect(getContrastThreshold(ContrastCategory.normalText, ContrastLevel.aa)).toBe(4.5);
  });

  it('should return 7 for normal text at AAA', () => {
    expect(getContrastThreshold(ContrastCategory.normalText, ContrastLevel.aaa)).toBe(7);
  });

  it('should return 3 for large text at AA', () => {
    expect(getContrastThreshold(ContrastCategory.largeText, ContrastLevel.aa)).toBe(3);
  });

  it('should return 3 for graphics at AA', () => {
    expect(getContrastThreshold(ContrastCategory.graphics, ContrastLevel.aa)).toBe(3);
  });

  it('should fall back to the AA threshold for graphics at AAA, since graphics has no AAA tier', () => {
    expect(getContrastThreshold(ContrastCategory.graphics, ContrastLevel.aaa)).toBe(3);
  });

  it('should resolve Auto to the Graphics thresholds, since there is no text context in a shape fill picker', () => {
    expect(getContrastThreshold(ContrastCategory.auto, ContrastLevel.aa)).toBe(3);
  });
});
