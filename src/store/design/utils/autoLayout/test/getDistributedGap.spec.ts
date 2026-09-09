// utils
import { getDistributedGap } from '../getDistributedGap';

describe('getDistributedGap', () => {
  it('should distribute the leftover space evenly between items', () => {
    expect(getDistributedGap(100, 40, 3)).toBe(30);
  });

  it('should clamp to 0 when the items already fill or overflow the available space', () => {
    expect(getDistributedGap(50, 80, 3)).toBe(0);
  });

  it('should return 0 for a single item, since there is no gap to distribute', () => {
    expect(getDistributedGap(100, 40, 1)).toBe(0);
  });

  it('should return 0 for zero items', () => {
    expect(getDistributedGap(100, 0, 0)).toBe(0);
  });

  it('should allow a negative gap when clamping to zero is disabled', () => {
    expect(getDistributedGap(50, 80, 3, false)).toBe(-15);
  });

  it('should still clamp a single item to 0 even when clamping is disabled', () => {
    expect(getDistributedGap(100, 40, 1, false)).toBe(0);
  });
});
