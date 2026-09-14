import { renderHook } from '@testing-library/react';

// hooks
import { useConvertToPatternPaint } from '../useConvertToPatternPaint';

// types
import { BlendMode } from 'types/design/enums';
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';
import { TPatternPanelChange } from 'shared/UITools/ColorPicker/Body/PatternPanel/types';

const SOLID_PAINT: TSolidPaint = { blendMode: BlendMode.multiply, color: '#d9d9d9', opacity: 80, type: 'solid', visible: false };

const GRADIENT_PAINT: TGradientPaint = {
  end: { x: 1, y: 0.5 },
  opacity: 100,
  start: { x: 0, y: 0.5 },
  stops: [{ color: '#ffffff', opacity: 100, position: 0 }],
  type: 'gradient-linear',
};

const CHANGE: TPatternPanelChange = {
  alignmentIndex: 2,
  direction: 'vertical',
  scale: 150,
  spacingX: 5,
  spacingY: 10,
  tileType: 'hexagonal',
};

describe('useConvertToPatternPaint', () => {
  it('should build a TPatternPaint carrying over blendMode, opacity, and visible from a solid paint, plus the panel change', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertToPatternPaint(SOLID_PAINT, onChange));

    // action
    result.current(CHANGE);

    // result
    expect(onChange).toHaveBeenCalledWith({ ...CHANGE, blendMode: 'multiply', opacity: 80, type: 'pattern', visible: false });
  });

  it('should build a TPatternPaint carrying over blendMode, opacity, and visible from a gradient paint, plus the panel change', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertToPatternPaint(GRADIENT_PAINT, onChange));

    // action
    result.current(CHANGE);

    // result
    expect(onChange).toHaveBeenCalledWith({ ...CHANGE, blendMode: undefined, opacity: 100, type: 'pattern', visible: undefined });
  });
});
