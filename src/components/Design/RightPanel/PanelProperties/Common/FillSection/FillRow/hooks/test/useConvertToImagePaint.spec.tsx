import { renderHook } from '@testing-library/react';

// hooks
import { useConvertToImagePaint } from '../useConvertToImagePaint';

// types
import { BlendMode } from 'types/design/enums';
import { TImagePanelChange } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';
import { TImagePaint, TSolidPaint } from 'types/design/paint/types';

const SOLID_PAINT: TSolidPaint = { blendMode: BlendMode.multiply, color: '#d9d9d9', opacity: 80, type: 'solid', visible: false };

const CHANGE: TImagePanelChange = { ref: 'blob:asset-1', scaleMode: 'fill' };

describe('useConvertToImagePaint', () => {
  it('should build a TImagePaint carrying over blendMode, opacity, and visible from the existing paint, plus the panel change', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertToImagePaint(SOLID_PAINT, onChange));

    // action
    result.current(CHANGE);

    // result
    expect(onChange).toHaveBeenCalledWith({ ...CHANGE, blendMode: 'multiply', opacity: 80, rotation: 0, type: 'image', visible: false });
  });

  it('should preserve the existing image paint’s crop, rotation, flip and adjustments when a new file replaces one already picked (regression: picking a real photo over an empty-ref placeholder that had already been cropped/panned reset it back to a fresh centered crop, since this hook always built a brand-new paint from scratch)', () => {
    // mock
    const onChange = vi.fn();
    const existingImagePaint: TImagePaint = {
      adjustments: { contrast: 0, exposure: 20, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 },
      blendMode: BlendMode.normal,
      crop: { height: 40, rotation: 0, width: 60, x: 25, y: 15 },
      flipX: true,
      opacity: 100,
      ref: '',
      rotation: 90,
      scale: 0.5,
      scaleMode: 'fill',
      type: 'image',
      visible: true,
    };

    // before
    const { result } = renderHook(() => useConvertToImagePaint(existingImagePaint, onChange));

    // action — picking a real file over the placeholder
    result.current({ ref: 'blob:asset-2', scaleMode: 'fill' });

    // result — only ref (and scaleMode) come from the fresh pick; everything else about how the
    // placeholder was already positioned/cropped/adjusted carries straight over onto the real photo
    expect(onChange).toHaveBeenCalledWith({ ...existingImagePaint, ref: 'blob:asset-2', scaleMode: 'fill' });
  });
});
