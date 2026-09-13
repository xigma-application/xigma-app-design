// utils
import { getSliderThumbOffset } from '../getSliderThumbOffset';

describe('getSliderThumbOffset', () => {
  it('should offset by exactly the radius at fraction 0, keeping the thumb inside the left edge', () => {
    expect(getSliderThumbOffset(0, 8)).toBe('calc(8px + 0 * (100% - 16px))');
  });

  it('should offset to the far side minus the radius at fraction 1, keeping the thumb inside the right edge', () => {
    expect(getSliderThumbOffset(1, 8)).toBe('calc(8px + 1 * (100% - 16px))');
  });

  it('should scale the travel range by the fraction in between', () => {
    expect(getSliderThumbOffset(0.5, 8)).toBe('calc(8px + 0.5 * (100% - 16px))');
  });
});
