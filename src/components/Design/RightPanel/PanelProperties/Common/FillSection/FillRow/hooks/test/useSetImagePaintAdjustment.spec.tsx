import { renderHook } from '@testing-library/react';

// hooks
import { useSetImagePaintAdjustment } from '../useSetImagePaintAdjustment';

// types
import { TImagePaint, TSolidPaint } from 'types/design/paint/types';

const IMAGE_PAINT: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };
const SOLID_PAINT: TSolidPaint = { color: '#d9d9d9', opacity: 100, type: 'solid' };

describe('useSetImagePaintAdjustment', () => {
  it('should set a single field on top of the all-zero identity when the paint has no adjustments stored yet', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetImagePaintAdjustment(IMAGE_PAINT, onChange));

    // action
    result.current('exposure', 42);

    // result
    expect(onChange).toHaveBeenCalledWith({
      ...IMAGE_PAINT,
      adjustments: { contrast: 0, exposure: 42, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 },
    });
  });

  it('should merge a new field into the paint’s existing adjustments, leaving the others untouched', () => {
    // mock
    const onChange = vi.fn();
    const adjustments = { contrast: -10, exposure: 42, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 };
    const paint: TImagePaint = { ...IMAGE_PAINT, adjustments };

    // before
    const { result } = renderHook(() => useSetImagePaintAdjustment(paint, onChange));

    // action
    result.current('saturation', 20);

    // result
    expect(onChange).toHaveBeenCalledWith({ ...paint, adjustments: { ...adjustments, saturation: 20 } });
  });

  it('should do nothing for a non-image paint', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetImagePaintAdjustment(SOLID_PAINT, onChange));

    // action
    result.current('exposure', 42);

    // result
    expect(onChange).not.toHaveBeenCalled();
  });
});
