// utils
import { getRotatedAxisScales } from '../getRotatedAxisScales';

describe('getRotatedAxisScales', () => {
  it('should pass the world scales through unchanged at 0deg rotation', () => {
    // result
    const result = getRotatedAxisScales(2, 3, 0);

    expect(result.x).toBeCloseTo(2);
    expect(result.y).toBeCloseTo(3);
  });

  it('should swap the world scales onto the opposite local axis at 90deg rotation', () => {
    // result
    const result = getRotatedAxisScales(2, 3, 90);

    expect(result.x).toBeCloseTo(3);
    expect(result.y).toBeCloseTo(2);
  });

  it('should always return non-negative magnitudes, even for a negative (crossed) world scale', () => {
    // result
    const result = getRotatedAxisScales(-2, 3, 0);

    expect(result.x).toBeCloseTo(2);
    expect(result.y).toBeCloseTo(3);
  });

  it('should blend both world scales for a non-axis-aligned rotation', () => {
    // mock — matches the exact blend asserted end-to-end in continueResizeDrag.spec.ts's 30deg test
    // result
    const result = getRotatedAxisScales(2, 1, 30);

    expect(result.x).toBeCloseTo(1.8028, 3);
    expect(result.y).toBeCloseTo(1.3229, 3);
  });
});
