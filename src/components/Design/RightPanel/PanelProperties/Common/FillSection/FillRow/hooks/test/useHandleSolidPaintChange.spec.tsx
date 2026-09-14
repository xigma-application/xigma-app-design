import { renderHook } from '@testing-library/react';

// hooks
import { useHandleSolidPaintChange } from '../useHandleSolidPaintChange';

// types
import { BlendMode } from 'types/design/enums';
import { TGradientPaint } from 'types/design/paint/types';

const paint: TGradientPaint = {
  blendMode: BlendMode.normal,
  end: { x: 1, y: 1 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [],
  type: 'gradient-linear',
  visible: true,
};

describe('useHandleSolidPaintChange behaviors', () => {
  it('should build a solid paint carrying over blendMode and visible from the source paint', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useHandleSolidPaintChange(paint, onChange));

    // action
    result.current({ alpha: 50, hex: '#ff0000' });

    // result
    expect(onChange).toHaveBeenCalledWith({ blendMode: 'normal', color: '#ff0000', opacity: 50, type: 'solid', visible: true });
  });
});
