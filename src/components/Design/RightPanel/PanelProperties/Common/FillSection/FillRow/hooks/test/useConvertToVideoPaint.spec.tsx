import { renderHook } from '@testing-library/react';

// hooks
import { useConvertToVideoPaint } from '../useConvertToVideoPaint';

// types
import { BlendMode } from 'types/design/enums';
import { TSolidPaint, TVideoPaint } from 'types/design/paint/types';
import { TVideoPanelChange } from 'shared/UITools/ColorPicker/Body/VideoPanel/types';

const SOLID_PAINT: TSolidPaint = { blendMode: BlendMode.multiply, color: '#d9d9d9', opacity: 80, type: 'solid', visible: false };

const CHANGE: TVideoPanelChange = { ref: 'blob:asset-1', scaleMode: 'fill' };

describe('useConvertToVideoPaint', () => {
  it('should build a TVideoPaint carrying over blendMode, opacity, and visible from the existing paint, plus the panel change', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertToVideoPaint(SOLID_PAINT, onChange));

    // action
    result.current(CHANGE);

    // result
    expect(onChange).toHaveBeenCalledWith({ ...CHANGE, blendMode: 'multiply', opacity: 80, rotation: 0, type: 'video', visible: false });
  });

  it('should preserve the existing video paint’s crop, rotation and flip when a new file replaces one already picked', () => {
    // mock
    const onChange = vi.fn();
    const existingVideoPaint: TVideoPaint = {
      blendMode: BlendMode.normal,
      crop: { height: 40, rotation: 0, width: 60, x: 25, y: 15 },
      flipX: true,
      opacity: 100,
      ref: '',
      rotation: 90,
      scale: 0.5,
      scaleMode: 'fill',
      type: 'video',
      visible: true,
    };

    // before
    const { result } = renderHook(() => useConvertToVideoPaint(existingVideoPaint, onChange));

    // action — picking a real file over the placeholder
    result.current({ ref: 'blob:asset-2', scaleMode: 'fill' });

    // result — only ref (and scaleMode) come from the fresh pick; everything else about how the
    // placeholder was already positioned/cropped carries straight over onto the real video
    expect(onChange).toHaveBeenCalledWith({ ...existingVideoPaint, ref: 'blob:asset-2', scaleMode: 'fill' });
  });
});
