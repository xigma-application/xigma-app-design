// utils
import { isRotationAxisSwapped } from '../isRotationAxisSwapped';

describe('isRotationAxisSwapped', () => {
  it('should not be swapped at 0deg, where local axes equal world axes', () => {
    // result
    expect(isRotationAxisSwapped(0)).toBe(false);
  });

  it('should be swapped at 90deg, where local axes are perpendicular to world axes', () => {
    // result
    expect(isRotationAxisSwapped(90)).toBe(true);
  });

  it('should not be swapped below 45deg, where the local axes sit closer to the world axes', () => {
    // result
    expect(isRotationAxisSwapped(30)).toBe(false);
  });

  it('should be swapped above 45deg, where the local axes sit closer to the perpendicular world axes', () => {
    // result
    expect(isRotationAxisSwapped(60)).toBe(true);
  });

  it('should not be swapped exactly at 45deg, treating a tie as unswapped', () => {
    // result
    expect(isRotationAxisSwapped(45)).toBe(false);
  });
});
