// utils
import { toRealCutIndex } from '../toRealCutIndex';

describe('toRealCutIndex', () => {
  it('should return the cut index untouched when there is no dragged placeholder', () => {
    expect(toRealCutIndex(3, null)).toBe(3);
  });

  it('should return the cut index untouched when it sits at or before the placeholder', () => {
    expect(toRealCutIndex(2, 2)).toBe(2);
    expect(toRealCutIndex(1, 2)).toBe(1);
  });

  it('should shift the cut index back by one once it falls past the placeholder', () => {
    // the placeholder itself occupies one slot in the simulated array, so any cut past it needs
    // shifting back to land on the real (placeholder-free) array
    expect(toRealCutIndex(3, 2)).toBe(2);
  });
});
