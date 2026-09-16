import { renderHook } from '@testing-library/react';

// hooks
import { useSetImagePaintScaleMode } from '../useSetImagePaintScaleMode';

// types
import { TImagePaint, TSolidPaint } from 'types/design/paint/types';

const IMAGE_PAINT: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };
const SOLID_PAINT: TSolidPaint = { color: '#d9d9d9', opacity: 100, type: 'solid' };

describe('useSetImagePaintScaleMode', () => {
  it('should commit the picked scale mode onto the image paint, carrying over every other field', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetImagePaintScaleMode(IMAGE_PAINT, onChange));

    // action
    result.current('fit');

    // result
    expect(onChange).toHaveBeenCalledWith({ ...IMAGE_PAINT, scaleMode: 'fit' });
  });

  it('should commit back to fill from fit', () => {
    // mock
    const onChange = vi.fn();
    const fitPaint: TImagePaint = { ...IMAGE_PAINT, scaleMode: 'fit' };

    // before
    const { result } = renderHook(() => useSetImagePaintScaleMode(fitPaint, onChange));

    // action
    result.current('fill');

    // result
    expect(onChange).toHaveBeenCalledWith({ ...fitPaint, scaleMode: 'fill' });
  });

  it('should do nothing for a fill mode with no matching paint scale mode yet, such as crop or tile', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetImagePaintScaleMode(IMAGE_PAINT, onChange));

    // action
    result.current('crop');
    result.current('tile');

    // result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should do nothing for a non-image paint', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetImagePaintScaleMode(SOLID_PAINT, onChange));

    // action
    result.current('fit');

    // result
    expect(onChange).not.toHaveBeenCalled();
  });
});
