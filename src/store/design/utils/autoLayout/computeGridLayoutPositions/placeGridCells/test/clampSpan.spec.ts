// utils
import { clampSpan } from '../clampSpan';

describe('clampSpan behaviors', () => {
  it('should default a missing span to one', () => {
    // before
    const span = clampSpan(undefined, 4);

    // result
    expect(span).toBe(1);
  });

  it('should round a fractional span and keep it at least one', () => {
    // result
    expect(clampSpan(2.4, 4)).toBe(2);
    expect(clampSpan(0.2, 4)).toBe(1);
  });

  it('should clamp a span above the max down to the max', () => {
    // before
    const span = clampSpan(9, 3);

    // result
    expect(span).toBe(3);
  });

  it('should treat a max below one as one', () => {
    // before
    const span = clampSpan(5, 0);

    // result
    expect(span).toBe(1);
  });
});
