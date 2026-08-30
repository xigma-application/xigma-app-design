// utils
import { isAxisSwapped } from '../isAxisSwapped';

describe('isAxisSwapped', () => {
  it('should be false at 0 degrees', () => {
    expect(isAxisSwapped(0)).toBe(false);
  });

  it('should be true at 90 degrees', () => {
    expect(isAxisSwapped(90)).toBe(true);
  });

  it('should be false at 180 degrees', () => {
    expect(isAxisSwapped(180)).toBe(false);
  });

  it('should be true at 270 degrees', () => {
    expect(isAxisSwapped(270)).toBe(true);
  });
});
