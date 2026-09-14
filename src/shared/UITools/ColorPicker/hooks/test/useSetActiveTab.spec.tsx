import { renderHook } from '@testing-library/react';

// hooks
import { useSetActiveTab } from '../useSetActiveTab';

// types
import { ColorPickerTab } from '../../enums';
import { TUseGradientPanelResult } from '../../Body/GradientPanel/hooks/useGradientPanel/useGradientPanel';
import { TUsePatternPanelResult } from '../../Body/PatternPanel/hooks/usePatternPanel';

const VALUE = { alpha: 100, hex: '#ff0000' };

const GRADIENT_PANEL = {
  angle: 90,
  reset: vi.fn(),
  stops: [{ color: '#ffffff', id: 'a', opacity: 100, position: 0 }],
  type: 'gradient-radial',
} as unknown as TUseGradientPanelResult;

const PATTERN_PANEL = {
  alignmentIndex: 3,
  reset: vi.fn(),
  scale: 150,
  spacingX: 5,
  spacingY: 10,
  tileType: 'circular',
} as unknown as TUsePatternPanelResult;

describe('useSetActiveTab', () => {
  it('should call setActiveTab when the tab name is a known ColorPickerTab', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(setActiveTab, vi.fn(), VALUE, GRADIENT_PANEL, PATTERN_PANEL));

    // action
    result.current(ColorPickerTab.gradient);

    // result
    expect(setActiveTab).toHaveBeenCalledWith(ColorPickerTab.gradient);
  });

  it('should not call setActiveTab when the tab name is unknown', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(setActiveTab, vi.fn(), VALUE, GRADIENT_PANEL, PATTERN_PANEL));

    // action
    result.current('unknown');

    // result
    expect(setActiveTab).not.toHaveBeenCalled();
  });

  it('should commit the current gradient panel state through onGradientChange when switching to Gradient', () => {
    // mock
    const onGradientChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), vi.fn(), VALUE, GRADIENT_PANEL, PATTERN_PANEL, onGradientChange));

    // action
    result.current(ColorPickerTab.gradient);

    // result
    expect(onGradientChange).toHaveBeenCalledWith({ angle: 90, stops: GRADIENT_PANEL.stops, type: 'gradient-radial' });
  });

  it('should not throw when switching to Gradient without an onGradientChange callback', () => {
    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), vi.fn(), VALUE, GRADIENT_PANEL, PATTERN_PANEL));

    // result
    expect(() => result.current(ColorPickerTab.gradient)).not.toThrow();
  });

  it('should reset the pattern panel state when switching to Gradient', () => {
    // mock
    const reset = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), vi.fn(), VALUE, GRADIENT_PANEL, { ...PATTERN_PANEL, reset }));

    // action
    result.current(ColorPickerTab.gradient);

    // result
    expect(reset).toHaveBeenCalled();
  });

  it('should commit the current solid value through onChange when switching to Solid', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), onChange, VALUE, GRADIENT_PANEL, PATTERN_PANEL));

    // action
    result.current(ColorPickerTab.solid);

    // result
    expect(onChange).toHaveBeenCalledWith(VALUE);
  });

  it('should reset the gradient and pattern panel state when switching to Solid, so a later switch starts fresh', () => {
    // mock
    const gradientReset = vi.fn();
    const patternReset = vi.fn();

    // before
    const { result } = renderHook(() =>
      useSetActiveTab(vi.fn(), vi.fn(), VALUE, { ...GRADIENT_PANEL, reset: gradientReset }, { ...PATTERN_PANEL, reset: patternReset }),
    );

    // action
    result.current(ColorPickerTab.solid);

    // result
    expect(gradientReset).toHaveBeenCalled();
    expect(patternReset).toHaveBeenCalled();
  });

  it('should not reset the gradient panel state when switching to Gradient', () => {
    // mock
    const reset = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), vi.fn(), VALUE, { ...GRADIENT_PANEL, reset }, PATTERN_PANEL));

    // action
    result.current(ColorPickerTab.gradient);

    // result
    expect(reset).not.toHaveBeenCalled();
  });

  it('should commit the current pattern panel state through onPatternChange when switching to Pattern', () => {
    // mock
    const onPatternChange = vi.fn();

    // before
    const { result } = renderHook(() =>
      useSetActiveTab(vi.fn(), vi.fn(), VALUE, GRADIENT_PANEL, PATTERN_PANEL, undefined, onPatternChange),
    );

    // action
    result.current(ColorPickerTab.pattern);

    // result
    expect(onPatternChange).toHaveBeenCalledWith({ alignmentIndex: 3, scale: 150, spacingX: 5, spacingY: 10, tileType: 'circular' });
  });

  it('should reset the gradient panel state when switching to Pattern', () => {
    // mock
    const reset = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), vi.fn(), VALUE, { ...GRADIENT_PANEL, reset }, PATTERN_PANEL));

    // action
    result.current(ColorPickerTab.pattern);

    // result
    expect(reset).toHaveBeenCalled();
  });

  it('should not reset the pattern panel state when switching to Pattern', () => {
    // mock
    const reset = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), vi.fn(), VALUE, GRADIENT_PANEL, { ...PATTERN_PANEL, reset }));

    // action
    result.current(ColorPickerTab.pattern);

    // result
    expect(reset).not.toHaveBeenCalled();
  });

  it('should not throw when switching to Pattern without an onPatternChange callback', () => {
    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), vi.fn(), VALUE, GRADIENT_PANEL, PATTERN_PANEL));

    // result
    expect(() => result.current(ColorPickerTab.pattern)).not.toThrow();
  });

  it('should not commit anything when the tab name is unknown', () => {
    // mock
    const onChange = vi.fn();
    const onGradientChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), onChange, VALUE, GRADIENT_PANEL, PATTERN_PANEL, onGradientChange));

    // action
    result.current('unknown');

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(onGradientChange).not.toHaveBeenCalled();
  });
});
