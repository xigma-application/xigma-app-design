// types
import { TImagePaint } from 'types/design/paint/types';

// utils
import { getImagePaintAdjustments } from '../getImagePaintAdjustments';

const BASE_PAINT: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

describe('getImagePaintAdjustments', () => {
  it('should return the all-zero identity adjustments when the paint has none stored', () => {
    // result
    expect(getImagePaintAdjustments(BASE_PAINT)).toEqual({
      contrast: 0,
      exposure: 0,
      highlights: 0,
      saturation: 0,
      shadows: 0,
      temperature: 0,
      tint: 0,
    });
  });

  it('should return the paint’s own stored adjustments when set', () => {
    // mock
    const adjustments = { contrast: -10, exposure: 42, highlights: 30, saturation: 20, shadows: -30, temperature: -20, tint: 15 };

    // result
    expect(getImagePaintAdjustments({ ...BASE_PAINT, adjustments })).toBe(adjustments);
  });
});
