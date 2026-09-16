import { renderHook } from '@testing-library/react';

// hooks
import { useConvertToImagePaint } from '../useConvertToImagePaint';

// types
import { BlendMode } from 'types/design/enums';
import { TImagePanelChange } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';
import { TSolidPaint } from 'types/design/paint/types';

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
});
