// utils
import { areGapsUniform } from '../areGapsUniform';

describe('areGapsUniform', () => {
  it('should be true when every value equals the mean', () => {
    expect(areGapsUniform([50, 50, 50], 4)).toBe(true);
  });

  it('should be true when values differ within tolerance', () => {
    expect(areGapsUniform([48, 52], 4)).toBe(true);
  });

  it('should be false when a value differs beyond tolerance', () => {
    expect(areGapsUniform([40, 60], 4)).toBe(false);
  });

  it('should be true for a single value', () => {
    expect(areGapsUniform([50], 4)).toBe(true);
  });
});
