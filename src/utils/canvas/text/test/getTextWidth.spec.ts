// utils
import { getTextWidth } from '../getTextWidth';

describe('getTextWidth', () => {
  it('should return 0 for an empty string', () => {
    // result
    expect(getTextWidth('', 12)).toBe(0);
  });

  it('should return a positive width for non-empty text', () => {
    // result
    expect(getTextWidth('Frame 1', 12)).toBeGreaterThan(0);
  });

  it('should grow as more characters are added', () => {
    // result
    expect(getTextWidth('Frame 12', 12)).toBeGreaterThan(getTextWidth('Frame 1', 12));
  });

  it('should scale up with a larger font size', () => {
    // result
    expect(getTextWidth('Frame 1', 24)).toBeGreaterThan(getTextWidth('Frame 1', 12));
  });
});
