// utils
import { getAutoLayoutBlockCounterLength } from '../getAutoLayoutBlockCounterLength';

describe('getAutoLayoutBlockCounterLength', () => {
  it('should return zero for no lines', () => {
    expect(getAutoLayoutBlockCounterLength(10, [])).toBe(0);
  });

  it('should return a single line’s thickness untouched, with no gap added', () => {
    expect(getAutoLayoutBlockCounterLength(10, [40])).toBe(40);
  });

  it('should sum thicknesses plus a gap between each consecutive line', () => {
    expect(getAutoLayoutBlockCounterLength(10, [40, 20, 30])).toBe(110);
  });
});
