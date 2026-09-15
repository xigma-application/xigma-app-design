import { renderHook } from '@testing-library/react';

// hooks
import { useConvertToPatternPaint } from '../useConvertToPatternPaint';

// types
import { BlendMode } from 'types/design/enums';
import { TGradientPaint, TPatternPaint, TSolidPaint } from 'types/design/paint/types';
import { TPatternPanelChange } from 'shared/UITools/ColorPicker/Body/PatternPanel/types';

const SOLID_PAINT: TSolidPaint = { blendMode: BlendMode.multiply, color: '#d9d9d9', opacity: 80, type: 'solid', visible: false };

const EXISTING_PATTERN_PAINT: TPatternPaint = {
  alignmentIndex: 0,
  direction: 'horizontal',
  frozenSourceSnapshot: null,
  offsetX: 0,
  offsetY: 0,
  opacity: 100,
  scale: 100,
  sourceNodeId: 'source-1',
  spacingX: 0,
  spacingY: 0,
  tileType: 'rectangular',
  type: 'pattern',
};

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
  offsetX: 0,
  offsetY: 0,
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

  it('should preserve sourceNodeId and frozenSourceSnapshot when editing panel settings on an already-picked pattern paint', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertToPatternPaint(EXISTING_PATTERN_PAINT, onChange));

    // action
    result.current(CHANGE);

    // result — a settings edit (e.g. spacing/scale) must not silently disconnect the live source
    expect(onChange).toHaveBeenCalledWith({
      ...CHANGE,
      blendMode: undefined,
      frozenSourceSnapshot: null,
      opacity: 100,
      sourceNodeId: 'source-1',
      type: 'pattern',
      visible: undefined,
    });
  });
});
