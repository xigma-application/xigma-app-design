import { renderHook } from '@testing-library/react';

// hooks
import { useRotateImagePaint } from '../useRotateImagePaint';

// types
import { TImagePaint, TSolidPaint } from 'types/design/paint/types';

const IMAGE_PAINT: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 90, scaleMode: 'fill', type: 'image' };
const SOLID_PAINT: TSolidPaint = { color: '#d9d9d9', opacity: 100, type: 'solid' };

describe('useRotateImagePaint', () => {
  it('should advance the rotation by 90 degrees, carrying over every other field', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useRotateImagePaint(IMAGE_PAINT, onChange));

    // action
    result.current();

    // result
    expect(onChange).toHaveBeenCalledWith({ ...IMAGE_PAINT, rotation: 180 });
  });

  it('should wrap back to 0 once a full turn is reached', () => {
    // mock
    const onChange = vi.fn();
    const paint: TImagePaint = { ...IMAGE_PAINT, rotation: 270 };

    // before
    const { result } = renderHook(() => useRotateImagePaint(paint, onChange));

    // action
    result.current();

    // result
    expect(onChange).toHaveBeenCalledWith({ ...paint, rotation: 0 });
  });

  it('should do nothing for a non-image paint', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useRotateImagePaint(SOLID_PAINT, onChange));

    // action
    result.current();

    // result
    expect(onChange).not.toHaveBeenCalled();
  });
});
