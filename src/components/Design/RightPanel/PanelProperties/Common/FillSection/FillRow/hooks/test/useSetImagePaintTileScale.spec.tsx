import { renderHook } from '@testing-library/react';

// hooks
import { useSetImagePaintTileScale } from '../useSetImagePaintTileScale';

// types
import { TImagePaint, TSolidPaint } from 'types/design/paint/types';

const IMAGE_PAINT: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 0, scale: 0.5, scaleMode: 'tile', type: 'image' };
const SOLID_PAINT: TSolidPaint = { color: '#d9d9d9', opacity: 100, type: 'solid' };

describe('useSetImagePaintTileScale', () => {
  it('should forward the new scale to onChange, carrying over every other field', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetImagePaintTileScale(IMAGE_PAINT, onChange));

    // action
    result.current(1.5);

    // result
    expect(onChange).toHaveBeenCalledWith({ ...IMAGE_PAINT, scale: 1.5 });
  });

  it('should do nothing for a non-image paint', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetImagePaintTileScale(SOLID_PAINT, onChange));

    // action
    result.current(1.5);

    // result
    expect(onChange).not.toHaveBeenCalled();
  });
});
